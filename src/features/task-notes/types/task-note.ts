import type { ApiResource } from "@/types/core/helpers";

export interface TaskNote extends ApiResource {
  title: string;
  body: string;
}

export interface TaskNotesResponse {
  data: TaskNote[];
}
