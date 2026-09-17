import { HttpResponse, http, type HttpResponseInit } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { newlyCreatedTask, tasks } from "@/test/store/tasks";

import type { Task, TaskResponse, TasksResponse } from "@/features/tasks/types/task";

export const mockTaskResponse = (data: Task, init?: HttpResponseInit) =>
  HttpResponse.json<TaskResponse>({ data }, init);

export const mockTasksResponse = (data: Task[]) => HttpResponse.json<TasksResponse>({ data });

export const taskHandlers = [
  http.get(apiRoutes.tasks, () => mockTasksResponse(tasks)),
  http.post(apiRoutes.tasks, () => mockTaskResponse(newlyCreatedTask, { status: 201 })),
  http.delete(apiRoutes.task(), () => new HttpResponse(null, { status: 204 })),
];
