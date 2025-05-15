/**
 * Merges two arrays of strings, ensuring uniqueness.
 * New items from arr2 are appended to arr1. Order of existing items in arr1 is preserved.
 * Order of new items from arr2 (relative to each other) is preserved.
 *
 * @param {string[]} arr1 - The base array.
 * @param {string[]} arr2 - The array to merge.
 * @returns {string[]} The merged array with unique strings.
 */
export const uniqueStringsConcatOrder = (arr1 = [], arr2 = []) => {
  if (!Array.isArray(arr1)) arr1 = []
  if (!Array.isArray(arr2)) arr2 = []

  if (!arr1.length) return [...new Set(arr2)] // Ensure arr2 is unique if arr1 is empty
  if (!arr2.length) return [...arr1]

  // Create a Set from arr1 for efficient `has` checks
  const set1 = new Set(arr1)
  // Filter items from arr2 that are not already in arr1
  const newUniqueItems = arr2.filter(item => !set1.has(item))

  return [...arr1, ...newUniqueItems]
}

/**
 * Merges two arrays of objects, ensuring uniqueness based on an identifier key.
 * New items from arr2 are appended to arr1. Order of existing items in arr1 is preserved.
 * Order of new items from arr2 (relative to each other) is preserved.
 *
 * @param {object[]} arr1 - The base array of objects.
 * @param {object[]} arr2 - The array of objects to merge.
 * @param {string} identifier - The key to use for identifying unique objects (e.g., "id", "key").
 * @returns {object[]} The merged array with unique objects.
 */
export const uniqueObjectsConcatOrder = (
  arr1 = [],
  arr2 = [],
  identifier = 'id' // Default to "id"
) => {
  if (!Array.isArray(arr1)) arr1 = []
  if (!Array.isArray(arr2)) arr2 = []

  if (!arr1.length) {
    // If arr1 is empty, ensure arr2 is unique before returning
    const uniqueArr2 = []
    const seenIds = new Set()
    for (const item of arr2) {
      const itemId = item?.[identifier]
      if (itemId !== undefined && !seenIds.has(itemId)) {
        uniqueArr2.push(item)
        seenIds.add(itemId)
      }
    }
    return uniqueArr2
  }
  if (!arr2.length) return [...arr1]

  const arr1Ids = new Set(
    arr1.map(item => item?.[identifier]).filter(id => id !== undefined)
  )

  const newUniqueItems = arr2.filter(item2 => {
    const item2Id = item2?.[identifier]
    return item2Id !== undefined && !arr1Ids.has(item2Id)
  })

  return [...arr1, ...newUniqueItems]
}
