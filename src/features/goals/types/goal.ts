import type { ApiResource } from "@/types/core/helpers";

// TODO: Migration so that `description` is not nullable, default to '' and then update these types.
export interface Goal extends ApiResource {
  name: string;
  description: string | null;
}

export interface GoalResponse {
  data: Goal;
}

export interface GoalsResponse {
  data: Goal[];
}

type GoalPayload = {
  goal: {
    name: string;
    description?: string | null;
  };
};

export type CreateGoalPayload = GoalPayload;

export type UpdateGoalPayload = GoalPayload;
