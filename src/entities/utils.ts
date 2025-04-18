export function mergeEntities(stateSlice = {}, newEntities = {}) {
  // Basic validation
  if (!newEntities || typeof newEntities !== "object") return stateSlice;

  const merged = { ...stateSlice };
  for (const [key, value] of Object.entries(newEntities)) {
    // Merge preserving existing properties if not overwritten
    merged[key] = { ...(stateSlice[key] || {}), ...value };
  }
  return merged;
}

export function removeEntity(stateSlice = {}, entityName, itemId) {
  // Guard clauses for invalid input
  if (!stateSlice || !entityName || !itemId || !stateSlice[entityName]) {
    return stateSlice;
  }

  const entityMap = { ...stateSlice[entityName] };
  const idsToRemove = Array.isArray(itemId) ? itemId : [itemId];

  // Use forEach for iteration
  idsToRemove.forEach((id) => {
    if (id !== null && id !== undefined) {
      // Ensure ID is valid before deleting
      delete entityMap[id];
    }
  });

  return {
    ...stateSlice,
    [entityName]: entityMap,
  };
}

