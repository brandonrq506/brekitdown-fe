import { toGoalPayload } from "./goal-payload";

it("trims the submitted values", () => {
  expect(toGoalPayload({ name: "  Ship release  ", description: "  Context  " })).toEqual({
    goal: { name: "Ship release", description: "Context" },
  });
});

it("sends a blank description as null", () => {
  expect(toGoalPayload({ name: "Ship release", description: "   " })).toEqual({
    goal: { name: "Ship release", description: null },
  });
});
