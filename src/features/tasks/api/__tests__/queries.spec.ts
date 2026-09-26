import { partialMatchKey } from "@tanstack/react-query";

import { recommendationsPageQueryOptions, taskKeys } from "../queries";

// Mutation hooks invalidate by `taskKeys.lists()`; recommendations must stay under that prefix.
it("nests the recommendations key under the task lists prefix", () => {
  expect(partialMatchKey(recommendationsPageQueryOptions().queryKey, taskKeys.lists())).toBe(true);
});
