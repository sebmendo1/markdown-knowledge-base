# ADR-0032: Import batch outcome

**Status:** Proposed

## Context

Import validates each file. Valid files become documents with one initial revision. Invalid files are listed with their errors. Nothing partial is saved per file. The PRD does not say whether one invalid file rolls back the rest of the batch.

"Nothing partial is saved per file" can be read as a file rule or as a batch rule. Those readings save different sets of documents.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. If any file in the batch has an error, save nothing.
2. Save every valid file. Skip every invalid file. Do not roll back the valid ones. A single file is still all or nothing.
3. Save a file's valid frontmatter even when the body fails.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

A file is imported only when it has zero validation errors. Warnings do not reject it. If it has an error, no document and no revision are written for that file.

The batch does not roll back. Every valid file in the batch is saved even when other files in the same batch fail. If every file fails, nothing is saved.

The result lists each saved path and each rejected path with that file's error codes. It is returned after the batch finishes, not file by file as a partial success the caller has to guess.

Files without frontmatter still import as `type: doc` with the file name as the title, as the PRD already says. That rule is not changed here.

## Replaces

The unstated batch outcome for import in section 2.3. The per-file rule (nothing partial is saved for one file) is kept.

## Consequences

- F06: a file with an error is not imported. Warnings still allow the import.
- F19: a mixed batch saves the valid files, lists the rejected files, and does not roll back.
