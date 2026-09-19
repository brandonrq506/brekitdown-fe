const MILLISECONDS_PER_SECOND = 1_000;

/**
 * Resolves a day selected by a Date-based calendar to the task's deadline instant.
 *
 * The input's local year, month, and day identify the selected calendar day. This finds the start
 * of the following day using local calendar operations, then subtracts one second to match the
 * API's precision. Because it does not add a fixed 24-hour duration, the browser applies the UTC
 * offset belonging to the next local day across daylight-saving transitions.
 *
 * The input is not mutated.
 *
 * @param selectedDay - A Date whose local calendar fields identify the selected day.
 * @returns A new Date for the final whole-second instant before the next local day begins.
 */
export const endOfLocalDay = (selectedDay: Date): Date => {
  const startOfNextDay = new Date(selectedDay);

  startOfNextDay.setDate(startOfNextDay.getDate() + 1);
  startOfNextDay.setHours(0, 0, 0, 0);

  return new Date(startOfNextDay.getTime() - MILLISECONDS_PER_SECOND);
};
