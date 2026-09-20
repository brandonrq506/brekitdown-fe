import { api, GOALS_ENDPOINT, TASKS_ENDPOINT, TIME_ENTRIES_ENDPOINT } from "@/libs/axios";

const apiUrl = (endpoint: string) => `${api.defaults.baseURL}${endpoint}`;

export const apiRoutes = {
  goals: apiUrl(GOALS_ENDPOINT),
  goal: (referenceXid = ":goalReferenceXid") => apiUrl(`${GOALS_ENDPOINT}/${referenceXid}`),
  tasks: apiUrl(TASKS_ENDPOINT),
  task: (referenceXid = ":taskReferenceXid") => apiUrl(`${TASKS_ENDPOINT}/${referenceXid}`),
  taskNotes: (taskReferenceXid = ":taskReferenceXid") =>
    apiUrl(`${TASKS_ENDPOINT}/${taskReferenceXid}/notes`),
  timeEntries: (taskReferenceXid = ":taskReferenceXid") =>
    apiUrl(`${TASKS_ENDPOINT}/${taskReferenceXid}${TIME_ENTRIES_ENDPOINT}`),
  timeEntry: (taskReferenceXid = ":taskReferenceXid", entryReferenceXid = ":entryReferenceXid") =>
    apiUrl(`${TASKS_ENDPOINT}/${taskReferenceXid}${TIME_ENTRIES_ENDPOINT}/${entryReferenceXid}`),
};
