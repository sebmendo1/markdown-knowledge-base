-- F07 storage contract. Not started. Do not apply this in the running app.
-- The live product stores Markdown files and browser localStorage.
-- Server drafts and this database are the PRD target.
--
-- PostgreSQL 15 or newer. Database encoding UTF8.
-- A character in a length check is one Unicode code point (char_length).
-- octet_length is the UTF-8 size because the encoding is UTF8.
--
-- Six PRD invariants:
-- 1. Revisions are immutable full snapshots.
--    Trigger revisions_immutable. content is the file. The insert trigger sets content_hash.
--    Not expressible: the text is the full file rather than a patch, and
--    frontmatter jsonb matches the YAML in content.
--    Tests: revisions_store_full_markdown (F07-AC-008a),
--           frontmatter_matches_content (F07-AC-008b).
-- 2. Only a human save or a merge creates a revision. Both run the validator.
--    Check revisions_human_or_merge constrains columns only.
--    Not expressible: the validator ran, and draft or propose did not call insert.
--    Tests: revision_requires_valid_document (F07-AC-012a),
--           only_human_save_or_merge_inserts_revision (F07-AC-013a).
-- 3. documents.head_revision_id moves in the same transaction as the insert.
--    Triggers revisions_set_head and documents_guard, deferred documents_head_present,
--    and the composite foreign key documents_head_same_document.
-- 4. links and metric_points are derived and can be rebuilt from revisions.
--    Not expressible: a Markdown parse cannot be a check.
--    Test: rebuild_links_and_metric_points (F07-AC-026a).
-- 5. Documents are archived, never deleted.
--    Trigger documents_no_delete. Test: F07-AC-007a.
-- 6. Version lookup returns the first revision whose version equals N.
--    Function revision_for_version. Index revisions_version_lookup.
--    Duplicate version values stay legal. Tests: F07-AC-027a, F07-AC-027b.
--
-- Also not expressible here:
-- shipped_draft_is_local_storage (F07-AC-002a)
-- server_draft_interval_is_2_seconds (F07-AC-022a, F07-AC-022b)
-- Messages Restore, Tick task, and Import are caller strings (F07-AC-016a,
-- F07-AC-017a, F07-AC-018a). SQL checks the 120-character one-line shape.
--
-- API codes are RAISE DETAIL and the constraint name.
-- The table owner and a superuser bypass row security. The application role
-- ledger_app must not own these tables. Test F07-AC-023a.

DO $$
BEGIN
  IF current_setting('server_encoding') <> 'UTF8' THEN
    RAISE EXCEPTION 'db.sql requires UTF8 encoding';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION ledger_session_user() RETURNS bigint
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT NULLIF(current_setting('ledger.user_id', true), '')::bigint
$$;

CREATE OR REPLACE FUNCTION storage_fail(
  p_code text,
  p_message text,
  p_hint text
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION USING
    ERRCODE = 'P0001',
    MESSAGE = p_message,
    DETAIL = p_code,
    HINT = p_hint,
    CONSTRAINT = p_code;
END;
$$;

-- Tables -----------------------------------------------------------------

CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL CHECK (char_length(name) >= 1),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_email_lower CHECK (email = lower(email))
);

CREATE UNIQUE INDEX users_email_lower ON users (email);

CREATE TABLE spaces (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug text NOT NULL,
  name text NOT NULL CHECK (char_length(name) >= 1),
  public_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT spaces_slug_shape CHECK (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND char_length(slug) BETWEEN 1 AND 80
  )
);

CREATE UNIQUE INDEX spaces_slug_unique ON spaces (slug);

CREATE TABLE memberships (
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  user_id bigint NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (space_id, user_id),
  CONSTRAINT memberships_role CHECK (
    role IN ('owner', 'editor', 'contributor', 'viewer')
  )
);

CREATE INDEX memberships_user ON memberships (user_id);

CREATE TABLE agent_keys (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  owner_user_id bigint NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  label text NOT NULL CHECK (char_length(label) >= 1),
  scope text NOT NULL,
  key_prefix text NOT NULL CHECK (char_length(key_prefix) >= 1),
  key_hash text NOT NULL,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT agent_keys_scope CHECK (scope IN ('read', 'propose')),
  CONSTRAINT agent_keys_hash CHECK (key_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX agent_keys_active ON agent_keys (space_id) WHERE revoked_at IS NULL;

CREATE TABLE documents (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  path text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  head_revision_id bigint,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT documents_slug_shape CHECK (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND char_length(slug) BETWEEN 1 AND 80
  ),
  CONSTRAINT documents_type_shape CHECK (
    type ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND char_length(type) BETWEEN 1 AND 80
  ),
  CONSTRAINT documents_title_length CHECK (char_length(title) BETWEEN 1 AND 120),
  CONSTRAINT documents_path_shape CHECK (
    path ~ '^([a-z0-9._/-]+)\.md$'
    AND position('..' IN path) = 0
    AND position('//' IN path) = 0
  ),
  CONSTRAINT documents_times CHECK (updated_at >= created_at),
  CONSTRAINT documents_archive_time CHECK (
    archived_at IS NULL OR archived_at >= created_at
  )
);

CREATE UNIQUE INDEX documents_slug_unique ON documents (space_id, slug);
CREATE UNIQUE INDEX documents_path_unique ON documents (space_id, path);
CREATE INDEX documents_space_archived ON documents (space_id, archived_at);

CREATE TABLE proposals (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  document_id bigint REFERENCES documents (id) ON DELETE RESTRICT,
  action text NOT NULL,
  path text NOT NULL,
  base_revision_id bigint,
  content text,
  edits jsonb,
  summary text NOT NULL,
  rationale text,
  status text NOT NULL,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  agent_key_id bigint REFERENCES agent_keys (id) ON DELETE RESTRICT,
  author_user_id bigint NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  reviewer_user_id bigint REFERENCES users (id) ON DELETE RESTRICT,
  review_note text,
  reviewed_at timestamptz,
  merged_revision_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT proposals_action CHECK (action IN ('create', 'update')),
  CONSTRAINT proposals_status CHECK (
    status IN ('open', 'changes_requested', 'merged', 'rejected', 'withdrawn')
  ),
  CONSTRAINT proposals_summary_length CHECK (
    char_length(summary) BETWEEN 1 AND 120
    AND position(E'\n' IN summary) = 0
    AND position(E'\r' IN summary) = 0
  ),
  CONSTRAINT proposals_body CHECK (num_nonnulls(content, edits) = 1),
  CONSTRAINT proposals_content_size CHECK (
    content IS NULL OR octet_length(content) BETWEEN 1 AND 204800
  ),
  CONSTRAINT proposals_edits_array CHECK (
    edits IS NULL OR jsonb_typeof(edits) = 'array'
  ),
  CONSTRAINT proposals_update_target CHECK (
    (action = 'create' AND base_revision_id IS NULL)
    OR (
      action = 'update'
      AND document_id IS NOT NULL
      AND base_revision_id IS NOT NULL
    )
  ),
  CONSTRAINT proposals_times CHECK (updated_at >= created_at)
);

CREATE INDEX proposals_space_status ON proposals (space_id, status, updated_at);
CREATE INDEX proposals_document ON proposals (document_id);

CREATE TABLE revisions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document_id bigint NOT NULL REFERENCES documents (id) ON DELETE RESTRICT,
  parent_revision_id bigint,
  content text NOT NULL,
  frontmatter jsonb NOT NULL,
  content_hash text NOT NULL,
  version integer,
  message text NOT NULL DEFAULT '',
  author_user_id bigint NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  agent_key_id bigint REFERENCES agent_keys (id) ON DELETE RESTRICT,
  proposal_id bigint REFERENCES proposals (id) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT revisions_id_document UNIQUE (id, document_id),
  CONSTRAINT revisions_one_child UNIQUE NULLS NOT DISTINCT (document_id, parent_revision_id),
  CONSTRAINT revisions_parent_older CHECK (
    parent_revision_id IS NULL OR parent_revision_id < id
  ),
  CONSTRAINT revisions_parent_same_document
    FOREIGN KEY (parent_revision_id, document_id)
    REFERENCES revisions (id, document_id)
    ON DELETE RESTRICT,
  CONSTRAINT revisions_content_size CHECK (octet_length(content) BETWEEN 1 AND 204800),
  CONSTRAINT revisions_frontmatter_object CHECK (jsonb_typeof(frontmatter) = 'object'),
  CONSTRAINT revisions_hash_shape CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT revisions_message_shape CHECK (
    char_length(message) <= 120
    AND position(E'\n' IN message) = 0
    AND position(E'\r' IN message) = 0
  ),
  CONSTRAINT revisions_human_or_merge CHECK (
    (proposal_id IS NULL AND agent_key_id IS NULL)
    OR proposal_id IS NOT NULL
  ),
  CONSTRAINT revisions_version_matches CHECK (
    CASE
      WHEN jsonb_typeof(frontmatter -> 'version') = 'number'
       AND (frontmatter ->> 'version')::numeric = trunc((frontmatter ->> 'version')::numeric)
       AND (frontmatter ->> 'version')::numeric BETWEEN 1 AND 999999999
      THEN version = (frontmatter ->> 'version')::numeric
      ELSE version IS NULL
    END
  )
);

CREATE INDEX revisions_document_order ON revisions (document_id, created_at, id);
CREATE INDEX revisions_version_lookup
  ON revisions (document_id, version, created_at, id)
  WHERE version IS NOT NULL;

ALTER TABLE documents
  ADD CONSTRAINT documents_head_same_document
  FOREIGN KEY (head_revision_id, id)
  REFERENCES revisions (id, document_id)
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE proposals
  ADD CONSTRAINT proposals_base_revision
  FOREIGN KEY (base_revision_id)
  REFERENCES revisions (id)
  ON DELETE RESTRICT;

ALTER TABLE proposals
  ADD CONSTRAINT proposals_merged_revision
  FOREIGN KEY (merged_revision_id)
  REFERENCES revisions (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE drafts (
  document_id bigint NOT NULL REFERENCES documents (id) ON DELETE RESTRICT,
  user_id bigint NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  content text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (document_id, user_id),
  CONSTRAINT drafts_content_size CHECK (octet_length(content) BETWEEN 1 AND 204800)
);

CREATE TABLE links (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_document_id bigint NOT NULL REFERENCES documents (id) ON DELETE RESTRICT,
  to_slug text NOT NULL,
  to_version integer,
  in_frontmatter boolean NOT NULL,
  field text,
  CONSTRAINT links_slug_shape CHECK (
    to_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    AND char_length(to_slug) BETWEEN 1 AND 80
  ),
  CONSTRAINT links_version_range CHECK (
    to_version IS NULL OR to_version BETWEEN 1 AND 999999999
  ),
  CONSTRAINT links_field_pair CHECK (
    (in_frontmatter AND field IS NOT NULL AND char_length(field) >= 1)
    OR (NOT in_frontmatter AND field IS NULL)
  )
);

-- Surrogate id is not in the PRD row. The identity of a link is the unique index.
CREATE UNIQUE INDEX links_identity ON links (
  from_document_id,
  to_slug,
  to_version,
  in_frontmatter,
  field
) NULLS NOT DISTINCT;

CREATE INDEX links_to_slug ON links (to_slug);
CREATE INDEX links_from_document ON links (from_document_id);

CREATE TABLE metric_points (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  experiment_document_id bigint NOT NULL REFERENCES documents (id) ON DELETE RESTRICT,
  revision_id bigint NOT NULL,
  eval_slug text NOT NULL,
  eval_version integer NOT NULL,
  metric_key text NOT NULL CHECK (char_length(metric_key) >= 1),
  value numeric NOT NULL,
  harness_slug text NOT NULL,
  harness_version integer NOT NULL,
  date date NOT NULL,
  environment text,
  sample_size integer,
  verdict text,
  CONSTRAINT metric_points_revision_document
    FOREIGN KEY (revision_id, experiment_document_id)
    REFERENCES revisions (id, document_id)
    ON DELETE RESTRICT,
  CONSTRAINT metric_points_identity UNIQUE (
    experiment_document_id, revision_id, metric_key
  ),
  CONSTRAINT metric_points_eval_slug CHECK (
    eval_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  CONSTRAINT metric_points_harness_slug CHECK (
    harness_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  CONSTRAINT metric_points_versions CHECK (
    eval_version BETWEEN 1 AND 999999999
    AND harness_version BETWEEN 1 AND 999999999
  ),
  CONSTRAINT metric_points_sample CHECK (sample_size IS NULL OR sample_size >= 0),
  CONSTRAINT metric_points_verdict CHECK (
    verdict IS NULL OR verdict IN ('supported', 'refuted', 'inconclusive')
  )
);

CREATE INDEX metric_points_chart
  ON metric_points (space_id, eval_slug, eval_version, metric_key, date);

CREATE TABLE assets (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  path text NOT NULL,
  blob_url text NOT NULL,
  mime text NOT NULL,
  bytes bigint NOT NULL CHECK (bytes >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assets_path_shape CHECK (
    path ~ '^([a-z0-9._/-]+)$'
    AND position('..' IN path) = 0
    AND position('//' IN path) = 0
  )
);

CREATE UNIQUE INDEX assets_path_unique ON assets (space_id, path);

CREATE TABLE audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id bigint NOT NULL REFERENCES spaces (id) ON DELETE RESTRICT,
  actor_user_id bigint REFERENCES users (id) ON DELETE RESTRICT,
  agent_key_id bigint REFERENCES agent_keys (id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (char_length(action) >= 1),
  target text NOT NULL CHECK (char_length(target) >= 1),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT audit_events_actor CHECK (
    actor_user_id IS NOT NULL OR agent_key_id IS NOT NULL
  ),
  CONSTRAINT audit_events_data_object CHECK (jsonb_typeof(data) = 'object')
);

CREATE INDEX audit_events_space_time ON audit_events (space_id, created_at);

-- Row security on drafts. Owner bypasses it, so ledger_app must not own drafts.
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY drafts_private ON drafts
  FOR ALL
  USING (user_id = ledger_session_user())
  WITH CHECK (
    user_id = ledger_session_user()
    AND EXISTS (
      SELECT 1
      FROM documents AS document
      JOIN memberships AS membership
        ON membership.space_id = document.space_id
       AND membership.user_id = ledger_session_user()
      WHERE document.id = drafts.document_id
        AND membership.role IN ('owner', 'editor', 'contributor')
    )
  );

-- Triggers ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION assert_writer(p_space_id bigint) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  uid bigint;
  agent text;
  found_role text;
BEGIN
  uid := ledger_session_user();
  agent := NULLIF(current_setting('ledger.agent_key_id', true), '');
  IF uid IS NULL AND agent IS NOT NULL THEN
    PERFORM storage_fail(
      'permission_denied',
      'Agents propose changes. They do not save directly.',
      'Call propose_change. Agents cannot merge, delete, or administer.'
    );
  END IF;
  IF uid IS NULL THEN
    PERFORM storage_fail(
      'permission_denied',
      'You do not have permission to change this document.',
      'Sign in as an owner or an editor.'
    );
  END IF;
  SELECT role INTO found_role
  FROM memberships
  WHERE space_id = p_space_id AND user_id = uid;
  IF found_role IN ('owner', 'editor') THEN
    RETURN;
  END IF;
  IF found_role = 'contributor' THEN
    PERFORM storage_fail(
      'permission_denied',
      'Contributors propose changes. They do not save directly.',
      'Submit a proposal instead of saving.'
    );
  END IF;
  PERFORM storage_fail(
    'permission_denied',
    'You do not have permission to change this document.',
    'Ask an owner for a role that can edit.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION revisions_before_insert() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_head bigint;
  bytes integer;
BEGIN
  bytes := octet_length(NEW.content);
  IF bytes > 204800 THEN
    PERFORM storage_fail(
      'too_large',
      format(
        'Document is %s bytes. The limit is 204800 bytes (200 KB).',
        bytes
      ),
      'Shorten the file to 204800 bytes or less, UTF-8.'
    );
  END IF;
  IF char_length(NEW.message) > 120
     OR position(E'\n' IN NEW.message) > 0
     OR position(E'\r' IN NEW.message) > 0 THEN
    PERFORM storage_fail(
      'message_invalid',
      'The save message must be one line of at most 120 characters.',
      'Shorten the message, or leave it empty.'
    );
  END IF;

  SELECT head_revision_id INTO current_head
  FROM documents
  WHERE id = NEW.document_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM storage_fail(
      'proposal_target',
      'The proposal targets a different document.',
      'Merge it into the document it names.'
    );
  END IF;

  IF NEW.parent_revision_id IS DISTINCT FROM current_head THEN
    PERFORM storage_fail(
      'head_moved',
      'This document changed. Review changes.',
      'Review the new head, then save again.'
    );
  END IF;

  NEW.author_user_id := ledger_session_user();
  NEW.created_at := clock_timestamp();
  NEW.content_hash := encode(digest(convert_to(NEW.content, 'UTF8'), 'sha256'), 'hex');

  IF jsonb_typeof(NEW.frontmatter -> 'version') = 'number'
     AND (NEW.frontmatter ->> 'version')::numeric = trunc((NEW.frontmatter ->> 'version')::numeric)
     AND (NEW.frontmatter ->> 'version')::numeric BETWEEN 1 AND 999999999 THEN
    NEW.version := (NEW.frontmatter ->> 'version')::integer;
  ELSE
    NEW.version := NULL;
  END IF;

  PERFORM set_config('ledger.appending', 'on', true);
  RETURN NEW;
END;
$$;

CREATE TRIGGER revisions_before_insert
  BEFORE INSERT ON revisions
  FOR EACH ROW
  EXECUTE FUNCTION revisions_before_insert();

CREATE OR REPLACE FUNCTION revisions_immutable() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM storage_fail(
    'revision_immutable',
    'Revisions cannot be changed.',
    'Save or merge to append a new revision.'
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER revisions_immutable
  BEFORE UPDATE OR DELETE ON revisions
  FOR EACH ROW
  EXECUTE FUNCTION revisions_immutable();

CREATE OR REPLACE FUNCTION revisions_set_head() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('ledger.appending', 'on', true);
  UPDATE documents
  SET head_revision_id = NEW.id,
      title = NEW.frontmatter ->> 'title',
      type = NEW.frontmatter ->> 'type',
      updated_at = NEW.created_at
  WHERE id = NEW.document_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER revisions_set_head
  AFTER INSERT ON revisions
  FOR EACH ROW
  EXECUTE FUNCTION revisions_set_head();

CREATE OR REPLACE FUNCTION revisions_merge_closed() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  proposal_status text;
  merged_id bigint;
BEGIN
  IF NEW.proposal_id IS NULL THEN
    RETURN NULL;
  END IF;
  SELECT status, merged_revision_id
    INTO proposal_status, merged_id
  FROM proposals
  WHERE id = NEW.proposal_id;
  IF proposal_status IS DISTINCT FROM 'merged'
     OR merged_id IS DISTINCT FROM NEW.id THEN
    PERFORM storage_fail(
      'merge_unclosed',
      'A merge must mark the proposal merged.',
      'Set the proposal status to merged and store the new revision id in the same transaction.'
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM audit_events
    WHERE action = 'merge'
      AND data ->> 'revision_id' = NEW.id::text
  ) THEN
    PERFORM storage_fail(
      'merge_audit',
      'A merge must record an audit event.',
      'Insert the audit event in the same transaction as the revision.'
    );
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER revisions_merge_closed
  AFTER INSERT ON revisions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION revisions_merge_closed();

CREATE OR REPLACE FUNCTION documents_no_delete() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM storage_fail(
    'delete_refused',
    'Documents are archived, not deleted.',
    'Archive the document. The row and its revisions stay.'
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER documents_no_delete
  BEFORE DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION documents_no_delete();

CREATE OR REPLACE FUNCTION documents_guard() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  structural boolean;
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.space_id IS DISTINCT FROM OLD.space_id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    PERFORM storage_fail(
      'document_locked',
      'Title, type, path, and slug change only when a revision is appended.',
      'Save or merge to change the document.'
    );
  END IF;

  IF NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
    IF OLD.archived_at IS NOT NULL OR NEW.archived_at IS NULL THEN
      PERFORM storage_fail(
        'archive_kept',
        'Archived documents stay archived.',
        'There is no un-archive. The row and its revisions stay.'
      );
    END IF;
    PERFORM assert_writer(NEW.space_id);
    NEW.archived_at := clock_timestamp();
    NEW.updated_at := NEW.archived_at;
  END IF;

  structural := NEW.head_revision_id IS DISTINCT FROM OLD.head_revision_id
    OR NEW.title IS DISTINCT FROM OLD.title
    OR NEW.type IS DISTINCT FROM OLD.type
    OR NEW.path IS DISTINCT FROM OLD.path
    OR NEW.slug IS DISTINCT FROM OLD.slug;

  IF structural AND current_setting('ledger.appending', true) IS DISTINCT FROM 'on' THEN
    PERFORM storage_fail(
      'document_locked',
      'Title, type, path, and slug change only when a revision is appended.',
      'Save or merge to change the document.'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER documents_guard
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION documents_guard();

CREATE OR REPLACE FUNCTION documents_match_head() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_head bigint;
  current_title text;
  current_type text;
  head_frontmatter jsonb;
  head_document bigint;
BEGIN
  -- NEW is the row image from the triggering statement. A later update in
  -- the same transaction is visible to this SELECT at commit time.
  SELECT head_revision_id, title, type
    INTO current_head, current_title, current_type
  FROM documents
  WHERE id = NEW.id;

  IF current_head IS NULL THEN
    PERFORM storage_fail(
      'head_missing',
      'A document has no revision.',
      'Insert the first revision in the same transaction.'
    );
  END IF;
  SELECT frontmatter, document_id
    INTO head_frontmatter, head_document
  FROM revisions
  WHERE id = current_head;
  IF head_document IS DISTINCT FROM NEW.id
     OR current_title IS DISTINCT FROM head_frontmatter ->> 'title'
     OR current_type IS DISTINCT FROM head_frontmatter ->> 'type' THEN
    PERFORM storage_fail(
      'document_locked',
      'Title, type, path, and slug change only when a revision is appended.',
      'Save or merge to change the document.'
    );
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER documents_head_present
  AFTER INSERT OR UPDATE ON documents
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION documents_match_head();

CREATE OR REPLACE FUNCTION links_no_update() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM storage_fail(
    'document_locked',
    'Derived rows are replaced, not edited.',
    'Delete and insert them in the save transaction, or run the rebuild script.'
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER links_no_update
  BEFORE UPDATE ON links
  FOR EACH ROW
  EXECUTE FUNCTION links_no_update();

CREATE OR REPLACE FUNCTION metric_points_no_update() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM storage_fail(
    'document_locked',
    'Derived rows are replaced, not edited.',
    'Delete and insert them in the save transaction, or run the rebuild script.'
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER metric_points_no_update
  BEFORE UPDATE ON metric_points
  FOR EACH ROW
  EXECUTE FUNCTION metric_points_no_update();

CREATE OR REPLACE FUNCTION audit_events_immutable() RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM storage_fail(
    'audit_immutable',
    'Audit events cannot be changed.',
    'Record a new audit event.'
  );
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_events_immutable
  BEFORE UPDATE OR DELETE ON audit_events
  FOR EACH ROW
  EXECUTE FUNCTION audit_events_immutable();

-- Version lookup. Earliest created_at, then smaller id. ADR-0017.
CREATE OR REPLACE FUNCTION revision_for_version(
  p_document_id bigint,
  p_version integer
) RETURNS bigint
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT id
  FROM revisions
  WHERE document_id = p_document_id
    AND version = p_version
  ORDER BY created_at ASC, id ASC
  LIMIT 1
$$;

-- Writes ------------------------------------------------------------------

CREATE OR REPLACE FUNCTION append_revision(
  p_document_id bigint,
  p_content text,
  p_frontmatter jsonb,
  p_message text,
  p_proposal_id bigint,
  p_expected_head bigint,
  p_path text,
  p_slug text,
  p_links jsonb,
  p_metric_points jsonb
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid bigint;
  space bigint;
  current_head bigint;
  current_path text;
  proposal_status text;
  proposal_document bigint;
  proposal_author bigint;
  proposal_agent bigint;
  proposal_summary text;
  stored_message text;
  stored_agent bigint;
  new_id bigint;
  write_metrics boolean;
BEGIN
  IF p_links IS NULL OR jsonb_typeof(p_links) <> 'array' THEN
    p_links := '[]'::jsonb;
  END IF;
  IF p_metric_points IS NULL OR jsonb_typeof(p_metric_points) <> 'array' THEN
    p_metric_points := '[]'::jsonb;
  END IF;

  SELECT space_id, head_revision_id, path
    INTO space, current_head, current_path
  FROM documents
  WHERE id = p_document_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM storage_fail(
      'proposal_target',
      'The proposal targets a different document.',
      'Merge it into the document it names.'
    );
  END IF;

  PERFORM assert_writer(space);

  IF current_head IS DISTINCT FROM p_expected_head THEN
    PERFORM storage_fail(
      'head_moved',
      'This document changed. Review changes.',
      'Review the new head, then save again.'
    );
  END IF;

  uid := ledger_session_user();
  stored_message := coalesce(p_message, '');
  stored_agent := NULL;

  IF p_proposal_id IS NOT NULL THEN
    SELECT status, document_id, author_user_id, agent_key_id, summary
      INTO proposal_status, proposal_document, proposal_author, proposal_agent, proposal_summary
    FROM proposals
    WHERE id = p_proposal_id
    FOR UPDATE;

    IF NOT FOUND OR proposal_status NOT IN ('open', 'changes_requested') THEN
      PERFORM storage_fail(
        'merge_closed',
        'This proposal is not open for merge.',
        'Merge an open proposal, or one with changes requested.'
      );
    END IF;
    IF proposal_document IS NOT NULL AND proposal_document IS DISTINCT FROM p_document_id THEN
      PERFORM storage_fail(
        'proposal_target',
        'The proposal targets a different document.',
        'Merge it into the document it names.'
      );
    END IF;
    stored_message := proposal_summary;
    stored_agent := proposal_agent;
  END IF;

  PERFORM set_config('ledger.appending', 'on', true);

  IF p_path IS NOT NULL AND p_path IS DISTINCT FROM current_path THEN
    UPDATE documents SET path = p_path, updated_at = clock_timestamp()
    WHERE id = p_document_id;
  END IF;
  IF p_slug IS NOT NULL THEN
    UPDATE documents SET slug = p_slug, updated_at = clock_timestamp()
    WHERE id = p_document_id
      AND slug IS DISTINCT FROM p_slug;
  END IF;

  INSERT INTO revisions (
    document_id,
    parent_revision_id,
    content,
    frontmatter,
    message,
    author_user_id,
    agent_key_id,
    proposal_id
  ) VALUES (
    p_document_id,
    current_head,
    p_content,
    p_frontmatter,
    stored_message,
    uid,
    stored_agent,
    p_proposal_id
  )
  RETURNING id INTO new_id;

  -- Outgoing links only. Other documents' to_slug values stay (F07-REQ-036).
  DELETE FROM links WHERE from_document_id = p_document_id;
  INSERT INTO links (from_document_id, to_slug, to_version, in_frontmatter, field)
  SELECT p_document_id, to_slug, to_version, in_frontmatter, field
  FROM jsonb_to_recordset(p_links) AS link_row(
    to_slug text,
    to_version integer,
    in_frontmatter boolean,
    field text
  );

  write_metrics := p_frontmatter ->> 'type' = 'experiment'
    AND p_frontmatter ->> 'status' = 'concluded';
  IF write_metrics THEN
    INSERT INTO metric_points (
      space_id,
      experiment_document_id,
      revision_id,
      eval_slug,
      eval_version,
      metric_key,
      value,
      harness_slug,
      harness_version,
      date,
      environment,
      sample_size,
      verdict
    )
    SELECT
      space,
      p_document_id,
      new_id,
      eval_slug,
      eval_version,
      metric_key,
      value,
      harness_slug,
      harness_version,
      date,
      environment,
      sample_size,
      verdict
    FROM jsonb_to_recordset(p_metric_points) AS point_row(
      eval_slug text,
      eval_version integer,
      metric_key text,
      value numeric,
      harness_slug text,
      harness_version integer,
      date date,
      environment text,
      sample_size integer,
      verdict text
    );
  END IF;

  IF p_proposal_id IS NOT NULL THEN
    UPDATE proposals
    SET document_id = p_document_id,
        status = 'merged',
        merged_revision_id = new_id,
        reviewer_user_id = uid,
        reviewed_at = clock_timestamp(),
        updated_at = clock_timestamp()
    WHERE id = p_proposal_id;

    INSERT INTO audit_events (
      space_id, actor_user_id, agent_key_id, action, target, data
    ) VALUES (
      space,
      uid,
      stored_agent,
      'merge',
      coalesce(p_path, current_path),
      jsonb_build_object(
        'revision_id', new_id,
        'proposal_id', p_proposal_id,
        'document_id', p_document_id
      )
    );

    DELETE FROM drafts
    WHERE document_id = p_document_id
      AND user_id IN (uid, proposal_author);
  ELSE
    DELETE FROM drafts
    WHERE document_id = p_document_id
      AND user_id = uid;
  END IF;

  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_document(
  p_space_id bigint,
  p_path text,
  p_slug text,
  p_content text,
  p_frontmatter jsonb,
  p_message text,
  p_proposal_id bigint,
  p_links jsonb,
  p_metric_points jsonb
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_document bigint;
  title text;
  doc_type text;
BEGIN
  PERFORM assert_writer(p_space_id);
  title := p_frontmatter ->> 'title';
  doc_type := p_frontmatter ->> 'type';
  INSERT INTO documents (space_id, path, slug, type, title)
  VALUES (p_space_id, p_path, p_slug, doc_type, title)
  RETURNING id INTO new_document;

  PERFORM append_revision(
    new_document,
    p_content,
    p_frontmatter,
    p_message,
    p_proposal_id,
    NULL,
    NULL,
    NULL,
    p_links,
    p_metric_points
  );
  RETURN new_document;
END;
$$;

CREATE OR REPLACE FUNCTION archive_document(p_document_id bigint) RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_archive timestamptz;
  space bigint;
BEGIN
  SELECT archived_at, space_id INTO current_archive, space
  FROM documents
  WHERE id = p_document_id
  FOR UPDATE;
  IF NOT FOUND THEN
    PERFORM storage_fail(
      'proposal_target',
      'The proposal targets a different document.',
      'Merge it into the document it names.'
    );
  END IF;
  IF current_archive IS NOT NULL THEN
    RETURN current_archive;
  END IF;
  PERFORM assert_writer(space);
  UPDATE documents
  SET archived_at = clock_timestamp()
  WHERE id = p_document_id
  RETURNING archived_at INTO current_archive;
  RETURN current_archive;
END;
$$;

CREATE OR REPLACE FUNCTION save_draft(
  p_document_id bigint,
  p_content text
) RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid bigint;
  found_role text;
  space bigint;
  bytes integer;
  stored timestamptz;
BEGIN
  uid := ledger_session_user();
  bytes := octet_length(p_content);
  IF bytes > 204800 THEN
    PERFORM storage_fail(
      'too_large',
      format(
        'Document is %s bytes. The limit is 204800 bytes (200 KB).',
        bytes
      ),
      'Shorten the file to 204800 bytes or less, UTF-8.'
    );
  END IF;
  IF uid IS NULL AND NULLIF(current_setting('ledger.agent_key_id', true), '') IS NOT NULL THEN
    PERFORM storage_fail(
      'permission_denied',
      'Agents propose changes. They do not save directly.',
      'Call propose_change. Agents cannot merge, delete, or administer.'
    );
  END IF;
  SELECT space_id INTO space FROM documents WHERE id = p_document_id;
  IF NOT FOUND THEN
    PERFORM storage_fail(
      'proposal_target',
      'The proposal targets a different document.',
      'Merge it into the document it names.'
    );
  END IF;
  SELECT role INTO found_role
  FROM memberships
  WHERE space_id = space AND user_id = uid;
  IF found_role IS NULL OR found_role = 'viewer' THEN
    PERFORM storage_fail(
      'permission_denied',
      'You do not have permission to change this document.',
      'Ask an owner for a role that can edit.'
    );
  END IF;

  INSERT INTO drafts (document_id, user_id, content, updated_at)
  VALUES (p_document_id, uid, p_content, clock_timestamp())
  ON CONFLICT (document_id, user_id)
  DO UPDATE SET content = EXCLUDED.content, updated_at = EXCLUDED.updated_at
  RETURNING updated_at INTO stored;
  RETURN stored;
END;
$$;

CREATE OR REPLACE FUNCTION read_draft(p_document_id bigint) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid bigint;
  body text;
BEGIN
  uid := ledger_session_user();
  SELECT content INTO body
  FROM drafts
  WHERE document_id = p_document_id
    AND user_id = uid;
  RETURN body;
END;
$$;

COMMENT ON TABLE documents IS
  'F07. Archived, never deleted. head_revision_id moves only in the append transaction.';
COMMENT ON TABLE revisions IS
  'F07. Immutable full Markdown snapshots. Insert only via append_revision or create_document.';
COMMENT ON TABLE drafts IS
  'F07 target. One private server draft per document and user. Not started. Interval is 2 seconds in the app, not in the database.';
COMMENT ON FUNCTION revision_for_version IS
  'First revision whose version equals N, by created_at then id.';

-- Application role. Not used by the live app. Not started.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ledger_app') THEN
    CREATE ROLE ledger_app NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO ledger_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ledger_app;
GRANT INSERT, UPDATE, DELETE ON
  proposals,
  links,
  metric_points,
  assets
TO ledger_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ledger_app;
GRANT EXECUTE ON FUNCTION
  ledger_session_user(),
  revision_for_version(bigint, integer),
  append_revision(bigint, text, jsonb, text, bigint, bigint, text, text, jsonb, jsonb),
  create_document(bigint, text, text, text, jsonb, text, bigint, jsonb, jsonb),
  archive_document(bigint),
  save_draft(bigint, text),
  read_draft(bigint)
TO ledger_app;

REVOKE INSERT, UPDATE, DELETE ON documents, revisions, drafts, audit_events, users, spaces, memberships, agent_keys FROM ledger_app;
REVOKE UPDATE ON links, metric_points FROM ledger_app;
REVOKE EXECUTE ON FUNCTION storage_fail(text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION assert_writer(bigint) FROM PUBLIC;
