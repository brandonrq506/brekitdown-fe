import type { ApiResource } from "@/types/core/helpers";

export interface TimeEntry extends ApiResource {
  started_at: string;
  ended_at: string | null;
}

export interface TimeEntriesResponse {
  data: TimeEntry[];
}

export interface TimeEntryResponse {
  data: TimeEntry;
}

export interface CreateTimeEntryPayload {
  time_entry: {
    started_at: string;
    ended_at?: string | null;
  };
}

export interface UpdateTimeEntryPayload {
  time_entry: {
    started_at?: string;
    ended_at?: string | null;
  };
}
