import { queryOptions } from "@tanstack/react-query";

import { getGoal } from "@/features/goals/api/axios/getGoal";
import { getGoals } from "@/features/goals/api/axios/getGoals";
import { GOALS_ENDPOINT } from "@/libs/axios";

export const goalKeys = {
  all: [{ feature: GOALS_ENDPOINT }] as const,
  lists: () => [{ ...goalKeys.all[0], entity: "list" }] as const,
  details: () => [{ ...goalKeys.all[0], entity: "details" }] as const,
  detail: (referenceXid: string) => [{ ...goalKeys.details()[0], referenceXid }] as const,
};

export const goalQueries = {
  list: () =>
    queryOptions({
      queryKey: goalKeys.lists(),
      queryFn: getGoals,
    }),
  detail: (referenceXid: string) =>
    queryOptions({
      queryKey: goalKeys.detail(referenceXid),
      queryFn: (context) => getGoal(referenceXid, context),
    }),
};
