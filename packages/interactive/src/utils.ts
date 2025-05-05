/**
 * Check if the device viewport matches that of a tablet or above.
 *
 * @returns – true if the screen width is tablet or above, false otherwise.
 */
export function isTabletOrAbove(): boolean {
  return window.matchMedia("(min-width: 768px)").matches;
}
