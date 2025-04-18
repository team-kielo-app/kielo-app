/**
 * Asserts that the given condition is truthy. Useful in cases
 * where you want to narrow the type of a variable to a non-nullable.
 *
 * @example
 * const foo = getFoo()
 *  // foo is TypeOfFoo | undefined
 * assert(foo)
 *  // foo is TypeOfFoo
 *
 * @template T
 *
 * @param {T | null | undefined} condition
 * @param {string} [message]
 *
 * @returns {asserts condition}
 */
export function assertInvariant(condition = null, message = "") {
  if (condition === null || condition === undefined) {
    throw new Error(message || "Invariant assertion failed");
  }
}
