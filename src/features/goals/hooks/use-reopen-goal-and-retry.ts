import { useState } from "react";

import { useReopenGoalMutation } from "@/features/goals/api/tanstack/use-reopen-goal";
import { GOAL_COMPLETED_CONFLICT_CODE } from "@/features/goals/constants/goal";
import { getApiConflictCode } from "@/libs/axios";

type BlockedAction = { goalReferenceXid: string; retry: () => void };

type ReopenGoal = ReturnType<typeof useReopenGoalMutation>["mutate"];

const isGoalCompletedConflict = (error: unknown) =>
  getApiConflictCode(error) === GOAL_COMPLETED_CONFLICT_CODE;

// Retries only once the reopen succeeded; on failure the dialog stays open to try again.
const reopenThenRetry = (reopen: ReopenGoal, blocked: BlockedAction, close: () => void) =>
  reopen(blocked.goalReferenceXid, {
    onSuccess: () => {
      close();
      blocked.retry();
    },
  });

/**
 * ADR-0001: the API refuses (409) to add or reopen a task in a Completed goal and never reopens
 * it on its own. `handleError` turns that refusal into a confirmation; `dialogProps` drive
 * `ReopenGoalDialog`, whose confirm reopens the goal and retries the blocked action.
 */
export const useReopenGoalAndRetry = () => {
  const [blocked, setBlocked] = useState<BlockedAction | null>(null);
  const { mutate: reopen, isPending } = useReopenGoalMutation();

  /** True when the error was the goal's refusal, now awaiting the user's decision. */
  const handleError = (error: unknown, goalReferenceXid: string | undefined, retry: () => void) => {
    const handled = goalReferenceXid !== undefined && isGoalCompletedConflict(error);
    if (handled) setBlocked({ goalReferenceXid, retry });
    return handled;
  };

  const onCancel = () => setBlocked(null);
  const onConfirm = () => {
    if (blocked !== null) reopenThenRetry(reopen, blocked, onCancel);
  };

  return {
    handleError,
    dialogProps: { open: blocked !== null, pending: isPending, onCancel, onConfirm },
  };
};
