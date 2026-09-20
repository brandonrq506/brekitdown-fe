import { useQuery } from "@tanstack/react-query";

import { taskNoteQueries } from "../queries";

/**
 * Mounting is the fetch gate: the disclosure panel holding the list unmounts while it is closed,
 * so this needs no `enabled` flag to stay off the wire until the user asks for the notes.
 */
export const useTaskNotes = (taskReferenceXid: string) =>
  useQuery(taskNoteQueries.list(taskReferenceXid));
