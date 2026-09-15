import type { Goal } from "@/features/goals/types/goal";

const goalDefaults = {
  reference_xid: "goal_01",
  inserted_at: "2026-08-20T12:00:00Z",
  updated_at: "2026-08-21T12:00:00Z",
  name: "Learn shadcn/ui",
  description: "Build a small interface with components we own.",
  archived_at: null,
  starred_at: null,
} satisfies Goal;

export const buildGoal = (overrides?: Partial<Goal>): Goal => ({
  ...goalDefaults,
  ...overrides,
});

export const goal = buildGoal();

export const goalWithoutDescription = buildGoal({
  reference_xid: "goal_02",
  inserted_at: "2026-08-20T13:00:00Z",
  updated_at: "2026-08-21T13:00:00Z",
  name: "Ship a feature",
  description: null,
});

export const starredGoal = buildGoal({ starred_at: "2026-09-13T12:00:00Z" });

export const newlyCreatedGoal = buildGoal({
  reference_xid: "goal_created",
  inserted_at: "2026-08-31T12:00:00Z",
  updated_at: "2026-08-31T12:00:00Z",
  name: "Ship release",
  description: null,
});

export const goals: Goal[] = [goal, goalWithoutDescription];
