// Helper utilities (assuming they are correctly placed in `src/pagination/utils.js`)
export function sliceAdd(array, to, item) {
  return item instanceof Array
    ? [...array.slice(0, to), ...item, ...array.slice(to, array.length)]
    : [...array.slice(0, to), item, ...array.slice(to, array.length)];
}

const mapExistence = (arr1, arr2, keyGetter) =>
  arr2.map((item2) => {
    const existingIndex = arr1.findIndex(
      (item1) => keyGetter(item1) === keyGetter(item2)
    );
    return {
      key: keyGetter(item2),
      exist: existingIndex !== -1,
      index: existingIndex,
    };
  });

const calculateAffectedRange = (updatedArr1, existenceMap, firstExistIndex) => {
  const firstCommonIndex = updatedArr1.findIndex(
    (item) => item === existenceMap[firstExistIndex]?.key // Adjust if comparing objects
  );
  const start =
    firstCommonIndex >= 0 &&
    firstExistIndex >= 0 &&
    firstCommonIndex - firstExistIndex >= 0
      ? firstCommonIndex - firstExistIndex
      : updatedArr1.length;

  return { start, end: start + existenceMap.length };
};

export const uniqueStringsConcatOrder = (arr1 = [], arr2 = []) => {
  if (!arr1?.length) return [...arr2];
  if (!arr2?.length) return [...arr1];

  let updatedArr1 = [...arr1];
  const existenceMap = mapExistence(updatedArr1, arr2, (item) => item);
  const firstExistIndex = existenceMap.findIndex(({ exist }) => exist);

  if (firstExistIndex === -1) {
    // No common elements, simple concat based on intended order (assume arr2 comes after arr1)
    return [...arr1, ...arr2];
  }

  const { start, end } = calculateAffectedRange(
    updatedArr1,
    existenceMap,
    firstExistIndex
  );

  // Ensure indices are valid before looping
  const safeStart = Math.max(0, start);
  const safeEnd = Math.min(updatedArr1.length + arr2.length, end); // Estimate max possible length

  for (let i = safeStart; i < safeEnd; i++) {
    const normalizedIndex = i - safeStart;
    if (normalizedIndex >= existenceMap.length) break; // Boundary check

    const { key, exist } = existenceMap[normalizedIndex] || {};

    if (!exist && normalizedIndex < arr2.length) {
      // Ensure arr2[normalizedIndex] is valid
      updatedArr1 = sliceAdd(updatedArr1, i, arr2[normalizedIndex]);
    } else if (
      key !== updatedArr1[i] &&
      i > safeStart &&
      i < updatedArr1.length
    ) {
      // If the existing item at this position doesn't match the expected key from arr2,
      // and it's not the first common element, remove the misplaced item from updatedArr1.
      // This handles cases where arr1 might have had items interleaved incorrectly.
      updatedArr1.splice(i, 1);
      i--; // Adjust loop counter after removal
    }
  }

  return updatedArr1;
};

export const uniqueObjectsConcatOrder = (
  arr1 = [],
  arr2 = [],
  identifier = "key"
) => {
  if (!arr1?.length) return [...arr2];
  if (!arr2?.length) return [...arr1];

  const keyGetter = (item) => item[identifier];
  let updatedArr1 = [...arr1];
  const existenceMap = mapExistence(updatedArr1, arr2, keyGetter);
  const firstExistIndex = existenceMap.findIndex(({ exist }) => exist);

  if (firstExistIndex === -1) {
    // No common elements
    return [...arr1, ...arr2];
  }

  const { start, end } = calculateAffectedRange(
    updatedArr1,
    existenceMap,
    firstExistIndex
  );

  // Ensure indices are valid before looping
  const safeStart = Math.max(0, start);
  const safeEnd = Math.min(updatedArr1.length + arr2.length, end);

  for (let i = safeStart; i < safeEnd; i++) {
    const normalizedIndex = i - safeStart;
    if (normalizedIndex >= existenceMap.length) break; // Boundary check

    const { key, exist } = existenceMap[normalizedIndex] || {};

    if (!exist && normalizedIndex < arr2.length) {
      // Ensure arr2[normalizedIndex] is valid
      updatedArr1 = sliceAdd(updatedArr1, i, arr2[normalizedIndex]);
    } else if (
      exist &&
      i < updatedArr1.length &&
      keyGetter(updatedArr1[i]) !== key &&
      i > safeStart
    ) {
      // If the existing item at this position doesn't match the expected key from arr2, remove it.
      updatedArr1.splice(i, 1);
      i--; // Adjust loop counter
    }
  }

  return updatedArr1;
};
