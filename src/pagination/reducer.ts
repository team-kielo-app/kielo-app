import { DEFAULT_PAGINATION_STATE } from './constants'
import type { PaginationStateType } from './types'
import { uniqueStringsConcatOrder, uniqueObjectsConcatOrder } from './utils'

function updateSinglePaginationState(
  state: PaginationStateType = DEFAULT_PAGINATION_STATE,
  action: any, // Use a more specific Action type if possible
  config: {
    // Pass config down
    requestTypes: string[]
    successTypes: string[]
    failureTypes: string[]
    idField: string
    resultField: string
  }
): PaginationStateType {
  // Return type annotation
  const { requestTypes, successTypes, failureTypes, idField, resultField } =
    config

  // --- Request ---
  if (requestTypes.includes(action.type)) {
    // Only update if not already fetching to avoid redundant state changes
    // unless the action explicitly forces it (e.g., via meta flag)
    if (state.isLoading && !action.meta?.forceRequest) {
      return state
    }
    return {
      ...state,
      isLoading: true,
      error: null
    }
  }

  // --- Failure ---
  if (failureTypes.includes(action.type)) {
    // Only update if it was actually fetching
    if (!state.isLoading) {
      return state
    }
    return {
      ...state,
      isLoading: false,
      error: action.error || 'An unexpected error occurred. Please try again.' // Store the error message
    }
  }

  // --- Success ---
  if (successTypes.includes(action.type)) {
    // Guard clause: Ensure response and meta are present
    if (!action.response || !action.meta) {
      console.warn(
        `Pagination reducer received success action ${action.type} without response or meta.`
      )
      // Return current state but mark as not loading if it was, maybe set an error
      return {
        ...state,
        isLoading: false,
        error: state.isLoading
          ? 'Invalid success response received'
          : state.error
      }
    }

    const newItems = action.response?.[resultField] || []
    const paginationMeta = action.meta // Contains PaginationMeta
    const shouldReset = paginationMeta?.reset ?? false

    // Defensive check for idField existence if items are objects
    const newIds = newItems
      .map(item => {
        if (typeof item === 'object' && item !== null) {
          const id = item[idField] ?? item.key // Allow fallback to 'key'
          if (id === undefined || id === null) {
            console.warn(
              `Pagination reducer: Item missing identifier ('${idField}' or 'key')`,
              item
            )
            return null // Represent invalid item as null
          }
          return id
        }
        return item // Assume string or number ID otherwise
      })
      .filter(id => id !== null) // Filter out items that couldn't be identified

    // Determine how to combine IDs
    let combinedIds = state.ids
    if (shouldReset) {
      combinedIds = newIds
    } else if (newIds.length > 0) {
      // Only concat if there are new IDs
      const areNewIdsStrings = newIds.every(id => typeof id === 'string')
      const areCurrentIdsStrings = state.ids.every(id => typeof id === 'string')

      // Choose concat strategy based on page fetched and ID types
      if (paginationMeta?.pageFetched === 'next') {
        combinedIds =
          areNewIdsStrings && areCurrentIdsStrings
            ? uniqueStringsConcatOrder(state.ids, newIds)
            : uniqueObjectsConcatOrder(state.ids, newIds, idField)
      } else if (paginationMeta?.pageFetched === 'prev') {
        combinedIds =
          areNewIdsStrings && areCurrentIdsStrings
            ? uniqueStringsConcatOrder(newIds, state.ids) // Prepend
            : uniqueObjectsConcatOrder(newIds, state.ids, idField) // Prepend
      } else {
        // Default for 'first' or unspecified non-reset fetch: Usually replace, but could merge if needed.
        // Let's stick to replacing for simplicity unless merging 'first' page is required.
        combinedIds = newIds
      }
    }
    // else: No new IDs, keep existing combinedIds

    // Calculate next page number
    let nextPageNumber = state.currentPage
    if (shouldReset || paginationMeta?.pageFetched === 'first') {
      nextPageNumber = newIds.length > 0 ? 1 : 0
    } else if (
      paginationMeta?.pageFetched === 'next' &&
      newIds.length > 0 &&
      state.isLoading
    ) {
      // Ensure it was loading this page
      nextPageNumber += 1
    }
    // Note: 'prev' fetch doesn't reliably map to decrementing page *number*

    // Extract pagination details from response, fallback to state or defaults
    const totalCount =
      action.response?.totalCount ?? (shouldReset ? 0 : state.totalCount)
    const nextPageKey =
      action.response?.nextPageKey !== undefined
        ? action.response.nextPageKey
        : null // Default to null
    const prevPageKey = action.response?.prevPageKey ?? null // Default to null
    const hasReachedEnd = nextPageKey === null || nextPageKey === '' // Determine end state

    return {
      ...state,
      ids: combinedIds,
      currentPage: nextPageNumber,
      pageSize: paginationMeta?.pageSize ?? state.pageSize,
      nextPageKey: nextPageKey,
      prevPageKey: prevPageKey,
      totalCount: totalCount,
      hasReachedEnd: hasReachedEnd,
      isLoading: false, // Mark as not loading
      error: null // Clear error on success
    }
  }

  // --- Handle implicit removal on success actions (e.g., after DELETE) ---
  // This requires meta flags indicating successful deletion and item ID
  // Example check:
  // if (action.meta?.isDeletionSuccess && action.meta?.itemId && successTypes.includes(action.type)) {
  //    const itemsToRemove = Array.isArray(action.meta.itemId) ? action.meta.itemId : [action.meta.itemId];
  //    const filteredIds = state.ids.filter(id => {
  //       const identifier = (typeof id === 'object' && id !== null) ? (id[idField] ?? id.key) : id;
  //       return !itemsToRemove.includes(identifier);
  //    });
  //    // Only update if IDs actually changed
  //    if (filteredIds.length !== state.ids.length) {
  //        return {
  //           ...state,
  //           ids: filteredIds,
  //           totalCount: Math.max(0, state.totalCount - itemsToRemove.length),
  //        }
  //    }
  // }

  // Default: return current state if action type is not handled
  return state
}

export function paginate(config: {
  requestTypes: string[]
  successTypes: string[]
  failureTypes: string[]
  idField?: string
  mapActionToKey: (action: any) => string | null
  resultField?: string
}) {
  // Validate config at the start
  const {
    requestTypes,
    successTypes,
    failureTypes,
    mapActionToKey,
    idField = 'id',
    resultField = 'result'
  } = config

  if (!requestTypes || !successTypes || !failureTypes || !mapActionToKey) {
    throw new Error(
      'paginate HOC requires requestTypes, successTypes, failureTypes, and mapActionToKey.'
    )
  }
  if (
    !Array.isArray(requestTypes) ||
    !Array.isArray(successTypes) ||
    !Array.isArray(failureTypes)
  ) {
    throw new Error('Action types must be arrays of strings.')
  }
  if (typeof mapActionToKey !== 'function') {
    throw new Error('mapActionToKey must be a function.')
  }

  const allRelevantTypes = new Set([
    ...requestTypes,
    ...successTypes,
    ...failureTypes
  ])
  const internalConfig = {
    requestTypes,
    successTypes,
    failureTypes,
    idField,
    resultField
  }

  const initialState = {}

  // Reducer that manages multiple pagination instances by key
  return function updatePaginationByKey(state = initialState, action) {
    // Global reset action
    if (action.type === 'RESET_ALL_PAGINATION') {
      return initialState
    }

    // Check if action type is relevant
    if (!allRelevantTypes.has(action.type)) {
      // Optional: Handle implicit removal based on meta here if preferred over updateSinglePaginationState
      // if (action.meta?.isDeletionSuccess && action.meta?.paginationKey ...) { ... }
      return state
    }

    // Get the dynamic key for this pagination instance
    const key = mapActionToKey(action)

    // Guard clause: If no key is derived, this action isn't for keyed pagination
    if (!key || typeof key !== 'string') {
      // console.warn(`Pagination key function returned invalid key for action: ${action.type}`);
      return state
    }

    // Delegate state update to the single instance handler
    const previousInstanceState = state[key]
    const nextInstanceState = updateSinglePaginationState(
      previousInstanceState,
      action,
      internalConfig
    )

    // Only update the state object if the instance state actually changed
    if (nextInstanceState === previousInstanceState) {
      return state
    }

    // Return the updated state map
    return {
      ...state,
      [key]: nextInstanceState
    }
  }
}
