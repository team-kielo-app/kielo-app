export function mergeEntities(stateSlice = {}, newEntities = {}) {
  // Basic validation
  if (!newEntities || typeof newEntities !== 'object') return stateSlice

  const merged = { ...stateSlice }
  for (const [key, value] of Object.entries(newEntities)) {
    // If new entity has _lastFetchedAt, or if existing doesn't, take new one.
    // Otherwise, if both have it, take the newer one.
    const existingEntity = stateSlice[key] as any
    const newEntity = value as any
    const existingLastFetched = existingEntity?._lastFetchedAt
    const newLastFetched = newEntity?._lastFetchedAt

    merged[key] = { ...(existingEntity || {}), ...newEntity } // Spread new over old
    // Ensure the latest _lastFetchedAt is preserved or set
    if (
      newLastFetched &&
      (!existingLastFetched || newLastFetched > existingLastFetched)
    ) {
      ;(merged[key] as any)._lastFetchedAt = newLastFetched
    } else if (existingLastFetched && !(merged[key] as any)._lastFetchedAt) {
      // If new entity somehow didn't have it but old one did, keep old one.
      // This case should be rare if createApiRequestThunk always adds it.
      ;(merged[key] as any)._lastFetchedAt = existingLastFetched
    }
  }
  return merged
}

export function removeEntity(stateSlice = {}, entityName, itemId) {
  // Guard clauses for invalid input
  if (!stateSlice || !entityName || !itemId || !stateSlice[entityName]) {
    return stateSlice
  }

  const entityMap = { ...stateSlice[entityName] }
  const idsToRemove = Array.isArray(itemId) ? itemId : [itemId]

  // Use forEach for iteration
  idsToRemove.forEach(id => {
    if (id !== null && id !== undefined) {
      // Ensure ID is valid before deleting
      delete entityMap[id]
    }
  })

  return {
    ...stateSlice,
    [entityName]: entityMap
  }
}
