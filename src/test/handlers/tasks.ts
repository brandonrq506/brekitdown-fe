import { HttpResponse, http, type HttpResponseInit } from "msw";

import { DEFAULT_PAGE_SIZE } from "@/constants/pagination";
import { apiRoutes } from "@/test/handlers/api-routes";
import { newlyCreatedTask, task, tasks } from "@/test/store/tasks";

import type {
  RecommendedTasksResponse,
  Task,
  TaskResponse,
  TasksResponse,
  UpdateTaskPayload,
} from "@/features/tasks/types/task";
import type { CursorPaginationMeta } from "@/types/pagination";

export const mockTaskResponse = (data: Task, init?: HttpResponseInit) =>
  HttpResponse.json<TaskResponse>({ data }, init);

export const mockTasksResponse = (data: Task[]) => HttpResponse.json<TasksResponse>({ data });

export const mockRecommendedTasksResponse = (
  data: Task[],
  meta: Partial<CursorPaginationMeta> = {},
) =>
  HttpResponse.json<RecommendedTasksResponse>({
    data,
    meta: { page_size: DEFAULT_PAGE_SIZE, has_next_page: false, end_cursor: null, ...meta },
  });

export const taskHandlers = [
  http.get(apiRoutes.tasks, () => mockTasksResponse(tasks)),
  http.post(apiRoutes.tasks, () => mockTaskResponse(newlyCreatedTask, { status: 201 })),
  http.patch<never, UpdateTaskPayload>(apiRoutes.task(), async ({ request }) => {
    const { task: changes } = await request.json();

    return mockTaskResponse({ ...task, ...changes });
  }),
  http.delete(apiRoutes.task(), () => new HttpResponse(null, { status: 204 })),
  http.get(apiRoutes.recommendations, () => mockRecommendedTasksResponse(tasks)),
];
