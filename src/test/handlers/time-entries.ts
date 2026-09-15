import { HttpResponse, http, type HttpResponseInit } from "msw";

import { apiRoutes } from "@/test/handlers/api-routes";
import { endedTimeEntry, runningTimeEntry, timeEntries } from "@/test/store/time-entries";

import type {
  TimeEntriesResponse,
  TimeEntry,
  TimeEntryResponse,
} from "@/features/time-entries/types/time-entry";

export const timeEntryResponse = (data: TimeEntry, init?: HttpResponseInit) =>
  HttpResponse.json<TimeEntryResponse>({ data }, init);

export const timeEntriesResponse = (data: TimeEntry[]) =>
  HttpResponse.json<TimeEntriesResponse>({ data });

export const timeEntryHandlers = [
  http.get(apiRoutes.timeEntries(), () => timeEntriesResponse(timeEntries)),
  http.post(apiRoutes.timeEntries(), () => timeEntryResponse(runningTimeEntry, { status: 201 })),
  http.patch(apiRoutes.timeEntry(), () => timeEntryResponse(endedTimeEntry)),
];
