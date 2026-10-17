import type { ApiFilter } from "@/types/api-query";

export type GoalApiFilters = {
  completed?: ApiFilter<boolean, "==">;
};
