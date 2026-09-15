import { goalHandlers } from "@/test/handlers/goals";
import { taskHandlers } from "@/test/handlers/tasks";
import { timeEntryHandlers } from "@/test/handlers/time-entries";

export const handlers = [...goalHandlers, ...taskHandlers, ...timeEntryHandlers];
