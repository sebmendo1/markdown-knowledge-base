# ADR-0016: required_when grammar

**Status:** Proposed

## Context

The experiment schema shows one conditional requirement:

`verdict: { kind: enum, values: [supported, refuted, inconclusive], required_when: { status: concluded } }`

`field_missing` includes `required_when`. The PRD shows equality against one field and no other operator. It does not say whether several keys, comparisons, or nested conditions are valid.

This ADR recommends one rule. The product owner has not confirmed it.

## Options

1. Treat `required_when` as free-form, and let each caller decide.
2. Allow only a single-field equality test. Any other shape is `schema_invalid` and the schema does not load.
3. Allow boolean expressions (`and`, `or`, `not`) in v1.

## Decision

This is a recommended resolution of an ambiguity. The product owner has not confirmed it.

`required_when` may be omitted. If it is present, it is a YAML mapping with exactly one key.

- That key is the name of another field on the same schema.
- The value is a scalar: a string, a number, or a boolean. It is not a list, a mapping, or null.
- The field that carries `required_when` is required if and only if the watched field's value equals that scalar.
- Equality is exact. The same YAML type and the same value. The string `"1"` does not equal the number `1`.
- If the condition is true and the field is absent or null, the document fails `field_missing`.
- If the condition is false, the field may be absent.

If the mapping is empty, has more than one key, names a field that is not on the schema, or holds a non-scalar, the schema file fails `schema_invalid` (ADR-0015) and does not load.

## Replaces

The unspecified `required_when` grammar in section 2.3, where only equality on one field is shown.

## Consequences

- F02: schema authors can express only one equality condition per field.
- F06: `field_missing` uses this condition. A bad `required_when` is `schema_invalid`, not a document error.
