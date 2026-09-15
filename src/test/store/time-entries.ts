import type { TimeEntry } from "@/features/time-entries/types/time-entry";

const timeEntryDefaults = {
  reference_xid: "time_entry_01",
  inserted_at: "2026-09-12T09:00:00Z",
  updated_at: "2026-09-12T09:00:00Z",
  started_at: "2026-09-12T09:00:00Z",
  ended_at: null,
} satisfies TimeEntry;

export const buildTimeEntry = (overrides?: Partial<TimeEntry>): TimeEntry => ({
  ...timeEntryDefaults,
  ...overrides,
});

export const runningTimeEntry = buildTimeEntry();

export const endedTimeEntry = buildTimeEntry({
  reference_xid: "time_entry_02",
  ended_at: "2026-09-12T10:00:00Z",
});

export const timeEntries: TimeEntry[] = [endedTimeEntry, runningTimeEntry];
