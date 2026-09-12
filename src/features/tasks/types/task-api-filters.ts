import type { ApiFilter } from "@/types/api-query";

export type TaskApiFilters = {
  goal_reference_xid?: ApiFilter<string, "==" | "empty">;
  due_at?: ApiFilter<string, "==" | "<" | "<=" | ">" | ">=" | "empty" | "not_empty">;
};
