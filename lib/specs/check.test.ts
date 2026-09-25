import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { acceptanceCoverage, checkSpecs } from "./check";

function tempTree(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "spec-check-"));
}

function write(root: string, file: string, source: string) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, source);
}

test("spec ids are unique and traced, and contracts parse", () => {
  assert.deepEqual(checkSpecs(process.cwd()), []);
});

test("absent feature specs, decisions, the PRD, and contracts are skipped", () => {
  const root = tempTree();
  try {
    write(root, "specs/PLAN.md", "See ADR-0099 and `prd:missing` and F12-REQ-014.\n");
    write(root, "specs/features/F01-file-format/tasks.md", "## F01-T01. Orphan\n- Requirements: F01-REQ-001\n");
    assert.deepEqual(checkSpecs(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("requirement ids are unique and each one is cited by a task step", () => {
  const root = tempTree();
  try {
    write(
      root,
      "specs/features/F01-file-format/spec.md",
      ["- F01-REQ-001 The system shall keep one id.", "- **F01-REQ-002** The system shall keep a second id.", "F01-REQ-001 is only mentioned here."].join("\n"),
    );
    write(
      root,
      "specs/features/F03-links/spec.md",
      "**F03-REQ-001** The system shall resolve a wiki target.\n",
    );
    write(
      root,
      "specs/features/F01-file-format/tasks.md",
      ["## F01-T01. First", "- **Requirements:** F01-REQ-001, F01-REQ-002", "## Coverage", "| F01-REQ-001 | F01-T01 |"].join("\n"),
    );
    write(
      root,
      "specs/features/F03-links/tasks.md",
      ["## 1. Resolve", "Satisfies: F03-REQ-001.", "The shell still lists F08-REQ-001."].join("\n"),
    );
    assert.deepEqual(checkSpecs(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("duplicate, untraced, and unknown requirement ids fail", () => {
  const root = tempTree();
  try {
    write(
      root,
      "specs/features/F01-file-format/spec.md",
      ["- F01-REQ-001 The system shall keep one id.", "- F01-REQ-001 The system shall not repeat an id.", "- F01-REQ-002 The system shall be cited by a task."].join("\n"),
    );
    write(
      root,
      "specs/features/F08-reading-shell/spec.md",
      "- F01-REQ-002 The system shall not reuse an id from another feature.\n",
    );
    write(
      root,
      "specs/features/F01-file-format/tasks.md",
      ["## Coverage", "| F01-REQ-002 | nowhere |", "| F01-REQ-009 | nowhere |", "## F01-T01. First", "- Requirements: F01-REQ-001, F01-REQ-009", "See F08-REQ-001 for the shell."].join("\n"),
    );
    const issues = checkSpecs(root);
    assert.ok(issues.some((issue) => issue.includes("spec.md defines F01-REQ-001 more than once")));
    assert.ok(issues.some((issue) => issue.includes("F01-REQ-002 is defined in")));
    assert.ok(issues.some((issue) => issue.includes("tasks.md does not cite F01-REQ-002")));
    assert.ok(issues.some((issue) => issue.includes("cites F01-REQ-009, which spec.md does not define")));
    assert.equal(issues.some((issue) => issue.includes("F08-REQ-001")), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("a spec without tasks is not required to trace yet", () => {
  const root = tempTree();
  try {
    write(root, "specs/features/X-cross-cutting/spec.md", "**X-REQ-001** The system shall wait for tasks.\n");
    assert.deepEqual(checkSpecs(root), []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("ADR links and prd anchors resolve when those files exist", () => {
  const root = tempTree();
  try {
    write(root, "specs/decisions/ADR-0001-name.md", "# ADR-0001\n");
    write(root, "specs/source/ledger-prd.md", "<!-- prd:summary -->\n");
    write(
      root,
      "specs/features/F01-file-format/spec.md",
      ["- F01-REQ-001 The system shall follow ADR-0001.", "Trace: `<!-- prd:summary -->`.", "[ADR-0001](../../decisions/ADR-0001-name.md)."].join("\n"),
    );
    assert.deepEqual(checkSpecs(root), []);

    write(root, "specs/features/F01-file-format/spec.md", "- F01-REQ-001 The system shall follow ADR-0002 and `prd:missing`.\n[missing](../../decisions/ADR-0002-nope.md)\n");
    const issues = checkSpecs(root);
    assert.ok(issues.some((issue) => issue.includes("cites ADR-0002")));
    assert.ok(issues.some((issue) => issue.includes("links to missing")));
    assert.ok(issues.some((issue) => issue.includes("cites prd:missing")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("JSON schemas and the OpenAPI contract parse when present", () => {
  const root = tempTree();
  try {
    write(root, "specs/contracts/type-schema.schema.json", "{}\n");
    write(root, "specs/contracts/rest.openapi.yaml", "openapi: 3.1.0\ninfo:\n  title: Ledger\n");
    assert.deepEqual(checkSpecs(root), []);

    write(root, "specs/contracts/type-schema.schema.json", "{");
    write(root, "specs/contracts/rest.openapi.yaml", ":\n  - [\n");
    const issues = checkSpecs(root);
    assert.ok(issues.some((issue) => issue.includes("type-schema.schema.json is not JSON")));
    assert.ok(issues.some((issue) => issue.includes("rest.openapi.yaml is not YAML")));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("acceptance coverage counts ids named in test files and skips superseded requirements", () => {
  const root = tempTree();
  try {
    write(
      root,
      "specs/features/F01-file-format/spec.md",
      ["- **F01-REQ-001** The system shall keep one id.", "- **F01-REQ-002** The old rule. Superseded by F01-REQ-003 (ADR-0035).", "- **F01-REQ-003** The new rule."].join("\n"),
    );
    write(
      root,
      "specs/features/F01-file-format/tasks.md",
      ["- **Requirements:** F01-REQ-001, F01-REQ-002, F01-REQ-003", "- **Tests:** `F01-AC-001a`, `F01-AC-001b`, `F01-AC-002a`, `F01-AC-003a`"].join("\n"),
    );
    write(root, "lib/format/a.test.ts", 'test("F01-AC-001a keeps one id", () => {});\n');
    write(root, "e2e/shell.spec.ts", "// F01-AC-003a\n");
    write(root, "lib/format/not-a-test.ts", "// F01-AC-001b\n");
    assert.deepEqual(acceptanceCoverage(root), [
      {
        feature: "F01-file-format",
        cited: ["F01-AC-001a", "F01-AC-001b", "F01-AC-003a"],
        covered: ["F01-AC-001a", "F01-AC-003a"],
        missing: ["F01-AC-001b"],
      },
    ]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
