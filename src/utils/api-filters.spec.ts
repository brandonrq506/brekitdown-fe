import { expectTypeOf } from "vite-plus/test";

import { normalizeFilters, serializeFilters } from "./api-filters";
import { taskKeys } from "@/features/tasks/api/queries";
import type { ApiFilter } from "@/types/api-query";

it("serializes multiple operators and fields deterministically", () => {
  const filters = { goal_reference_xid: { "==": "goal" }, due_at: { ">=": "start", "<": "end" } };
  expect([...serializeFilters(filters)]).toEqual([
    ["filters[0][field]", "due_at"],
    ["filters[0][op]", "<"],
    ["filters[0][value]", "end"],
    ["filters[1][field]", "due_at"],
    ["filters[1][op]", ">="],
    ["filters[1][value]", "start"],
    ["filters[2][field]", "goal_reference_xid"],
    ["filters[2][op]", "=="],
    ["filters[2][value]", "goal"],
  ]);
});

it("rejects empty membership lists while building the key, not at fetch time", () => {
  expect(() => normalizeFilters({ due_at: { in: [] } })).toThrow(TypeError);
  expect(() => serializeFilters({ due_at: { in: [] } })).toThrow(TypeError);
});

it("drops omitted entries and fields whose every operator is omitted", () => {
  expect(normalizeFilters({ a: { "==": undefined }, b: { "==": 1, ">": undefined } })).toEqual({
    b: { "==": 1 },
  });
});

it("sorts fields and operators so the serialized query string is deterministic", () => {
  const normalized = normalizeFilters({ b: { "==": 1 }, a: { ">": 1, "==": 1 } });

  expect(Object.keys(normalized)).toEqual(["a", "b"]);
  expect(Object.keys(normalized.a ?? {})).toEqual(["==", ">"]);
});

it("copies membership lists so the query key cannot alias caller state", () => {
  const source = { due_at: { in: ["first"] } };
  const normalized = normalizeFilters(source);

  source.due_at.in.push("second");

  expect(normalized).toEqual({ due_at: { in: ["first"] } });
});

it("drops an omitted operand instead of sending an empty value", () => {
  expect(serializeFilters({ due_at: { ">=": undefined } }).toString()).toBe("");
});

it("appends no query string when there is nothing to filter", () => {
  expect(serializeFilters({}).toString()).toBe("");
});

it("preserves false and zero and omits only undefined entries", () => {
  expect([
    ...serializeFilters({ example: { "==": 0, empty: false, ">": undefined } }).values(),
  ]).toEqual(["example", "==", "0", "example", "empty", "false"]);
});

it("enforces the task filter contract at compile time", () => {
  taskKeys.list({
    filter: { due_at: { ">=": "2026-09-02T00:00:00Z", empty: false } },
  });
  // @ts-expect-error Unsupported task property.
  taskKeys.list({ filter: { tags: { "==": "tag" } } });
  // @ts-expect-error Goal references only support equality.
  taskKeys.list({ filter: { goal_reference_xid: { "!=": "goal" } } });
  // @ts-expect-error Dates do not support pattern matching.
  taskKeys.list({ filter: { due_at: { ilike: "%" } } });
  // @ts-expect-error Comparisons require scalar timestamps.
  taskKeys.list({ filter: { due_at: { ">=": ["date"] } } });
  // @ts-expect-error Emptiness requires a boolean.
  taskKeys.list({ filter: { due_at: { empty: "false" } } });
  // @ts-expect-error Membership is not a selected due-date operator.
  taskKeys.list({ filter: { due_at: { in: ["2026-09-02T00:00:00Z"] } } });
  // @ts-expect-error Null is not a date operand; it would serialize as the literal "null".
  taskKeys.list({ filter: { due_at: { "==": null } } });
  // @ts-expect-error Timestamps cross the boundary as ISO strings, never as Date.
  taskKeys.list({ filter: { due_at: { ">=": new Date() } } });
});

it("selects only the requested operators and their operand types", () => {
  const comparison = { "==": 3, ">=": 1 } satisfies ApiFilter<number, "==" | ">=">;
  const membership = { in: ["date"], empty: false } satisfies ApiFilter<string, "in" | "empty">;

  expect(comparison[">="]).toBe(1);
  expect(membership.empty).toBe(false);

  // @ts-expect-error Operators must be explicitly selected.
  type MissingOperators = ApiFilter<string>;
  // @ts-expect-error Both generic arguments are required.
  type MissingArguments = ApiFilter;
  // Reference these aliases so unused-type diagnostics cannot mask the generic checks.
  expectTypeOf<MissingOperators>().toEqualTypeOf<MissingArguments>();

  // @ts-expect-error A valid global operator is still unavailable unless selected.
  ({ "<": 2 }) satisfies ApiFilter<number, "==" | ">=">;
  // @ts-expect-error The selected comparison uses the supplied value type.
  ({ ">=": "2" }) satisfies ApiFilter<number, "==" | ">=">;
  // @ts-expect-error Membership requires a list of the supplied value type.
  ({ in: [2] }) satisfies ApiFilter<string, "in">;
  ({ in: [] }) satisfies ApiFilter<string, "in">;
  // @ts-expect-error Emptiness always requires a boolean, regardless of TValue.
  ({ empty: "false" }) satisfies ApiFilter<string, "empty">;
  // @ts-expect-error Unknown operators cannot be selected.
  ({ "==": "date" }) satisfies ApiFilter<string, "unknown">;
});
