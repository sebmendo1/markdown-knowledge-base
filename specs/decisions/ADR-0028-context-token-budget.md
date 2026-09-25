# ADR-0028: get_context token budget

**Status:** Proposed

## Context

`get_context` returns `agents.md`, the active harness, active evals, current findings, accepted decisions, and the last 10 experiments. The flow text says this is roughly 2–6k tokens, trimmed to titles and frontmatter. The acceptance criterion is under 6k tokens for a space with 100 experiments.

The PRD names no tokenizer and no trim order. `detail` may be `brief` or `full`, and the return list does not differ by that flag. Two counters would disagree on whether a pack is under the cap, and two trim orders would drop different documents.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Leave "6k tokens" as a rough size with no trim order.
2. Count one token as 4 UTF-8 bytes, cap the pack at 6000 tokens, and drop the lowest-priority blocks first. `brief` and `full` return the same pack.
3. Count tokens with a model tokenizer and let `full` include every body.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

One token is 4 UTF-8 bytes of the whole pack, rounded up once: `ceil(byte_length / 4)`. The pack must be at most 6000 tokens, which is 24000 bytes.

Build the pack in this order. Each entry is one block:

1. The full text of `.ledger/agents.md`, if that file exists.
2. The active harness (`status: active`): a title line and its frontmatter. No body. If several are active, order them by slug ascending.
3. Each active eval: a title line, its frontmatter, and its `metrics` list. No other body. Order by slug ascending.
4. Each finding with `status: current`: a title line and its frontmatter. Newest `updated_at` first, oldest last.
5. Each decision with `status: accepted`: a title line and its frontmatter. Newest `updated_at` first, oldest last.
6. The 10 experiments with the latest `updated_at`: frontmatter only. Newest first, oldest of those 10 last.

While the pack is over 6000 tokens, remove the last block that belongs to group 4, 5, or 6. Do not remove groups 1–3 while any block from groups 4–6 remains. If the pack is still over 6000 tokens, truncate the remaining UTF-8 text from the end to 24000 bytes without splitting a code point.

`detail: brief` and `detail: full` both return this pack. The argument is accepted and does not add document bodies.

## Replaces

The missing tokenizer and trim order for the "under 6k tokens" `get_context` budget in section 2.3.

## Consequences

- F13: `get_context` returns this pack and drops blocks in the order above until it is at most 6000 of these tokens.
- X: the acceptance check "under 6k tokens for a space with 100 experiments" uses this byte rule.
