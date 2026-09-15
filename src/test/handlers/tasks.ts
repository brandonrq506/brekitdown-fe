import { HttpResponse, http } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { tasks } from "@/test/store/tasks";

import type { Task, TasksResponse } from "@/features/tasks/types/task";

export const mockTasksResponse = (data: Task[]) => HttpResponse.json<TasksResponse>({ data });

export const taskHandlers = [
  http.get(apiRoutes.tasks, () => mockTasksResponse(tasks)),
  http.delete(apiRoutes.task(), () => new HttpResponse(null, { status: 204 })),
];
