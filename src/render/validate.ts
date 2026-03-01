/**
 * Validate that scale is a positive integer.
 * Throws if scale is 0, negative, or non-integer.
 */
export function validateScale(scale: number): void {
  if (scale < 1 || !Number.isInteger(scale)) {
    throw new Error(`Scale must be a positive integer, got ${scale}`);
  }
}
