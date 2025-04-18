/**
 * Converts the given query params object to string.
 * Empty ('', null, undefined, []) values are ignored.
 *
 * @param {Record<string | number, unknown>} params
 *
 * @example
 * makeQueryString({
 *   a: "hello",
 *   b: "",
 *   c: null,
 *   d: [1,2],
 *   e: []
 * })
 * // returns "?a=hello&d=1&d=2"
 */
export function makeQueryString(params) {
  if (
    params === null ||
    !Object.values(params).filter((p) => Boolean(p)).length
  ) {
    return "";
  }

  const isEmptyArray = (value) =>
    Array.isArray(value) ? value.length === 0 : false;
  const isNonEmpty = (value) =>
    value !== null && value !== undefined && value !== "";

  const encodeParam = (name, value) =>
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  const encodeArray = (name, array) =>
    array
      .filter(isNonEmpty)
      .map((item) => (typeof item === "object" ? JSON.stringify(item) : item))
      .map((item) => encodeParam(name, item))
      .join("&");

  const parts = Object.entries(params)
    .filter(([_, value]) => isNonEmpty(value) && !isEmptyArray(value))
    .map(([name, value]) =>
      Array.isArray(value) ? encodeArray(name, value) : encodeParam(name, value)
    );

  return `?${parts.join("&")}`;
}
