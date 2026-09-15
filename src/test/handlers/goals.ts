import { HttpResponse, http, type HttpResponseInit } from "msw";

import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@/constants/pagination";
import { apiRoutes } from "@/test/handlers/api-routes";
import { goal, goals, newlyCreatedGoal, starredGoal } from "@/test/store/goals";

import type { Goal, GoalResponse, GoalsResponse } from "@/features/goals/types/goal";
import type { PaginationMeta } from "@/types/pagination";

const onePageMeta = (totalCount: number): PaginationMeta => ({
  current_page: FIRST_PAGE,
  page_size: DEFAULT_PAGE_SIZE,
  total_count: totalCount,
  total_pages: totalCount === 0 ? 0 : 1,
  has_next_page: false,
  has_previous_page: false,
  next_page: null,
  previous_page: null,
});

export const mockGoalResponse = (data: Goal, init?: HttpResponseInit) =>
  HttpResponse.json<GoalResponse>({ data }, init);

export const mockGoalsResponse = (data: Goal[], meta = onePageMeta(data.length)) =>
  HttpResponse.json<GoalsResponse>({ data, meta });

export const goalHandlers = [
  http.get(apiRoutes.goals, () => mockGoalsResponse(goals)),
  http.get(apiRoutes.goal(), () => mockGoalResponse(goal)),
  http.post(apiRoutes.goals, () => mockGoalResponse(newlyCreatedGoal, { status: 201 })),
  http.patch(apiRoutes.goal(), () => mockGoalResponse(starredGoal)),
  http.delete(apiRoutes.goal(), () => new HttpResponse(null, { status: 204 })),
];
