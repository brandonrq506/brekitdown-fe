import type { GoalFormValues, GoalPayload } from "@/features/goals/types/goal";

/**
 * Owns the request shape for both creating and updating a goal, so callers cannot
 * disagree on whether an omitted description is `""` or `null`.
 */
export const toGoalPayload = ({ name, description }: GoalFormValues): GoalPayload => {
  const trimmedDescription = description.trim();

  return {
    goal: {
      name: name.trim(),
      description: trimmedDescription === "" ? null : trimmedDescription,
    },
  };
};
