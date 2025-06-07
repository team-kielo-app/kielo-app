// src/entities/reducer.js
import { mergeEntities, removeEntity } from './utils'
import { fetchSavedItemsThunk } from '@features/savedItems/savedItemsActions'
import {
  LOGIN_SUCCESS,
  SOCIAL_LOGIN_SUCCESS,
  INITIALIZE_AUTH_SUCCESS
} from '@features/auth/authActionTypes'
import { fetchEntityByIdIfNeededThunk } from '@features/entities/entityActions'
import { FETCH_ARTICLES_SUCCESS } from '@features/articles/articlesActionTypes' // Example list success
// Import other list success action types:
// import { FETCH_VOCABULARY_SUCCESS } from "@features/vocabulary/vocabularyActionTypes";

const FETCH_ENTITY_BY_ID_PENDING = 'entities/fetchByIdIfNeeded/pending'
const FETCH_ENTITY_BY_ID_FULFILLED = 'entities/fetchByIdIfNeeded/fulfilled'
const FETCH_ENTITY_BY_ID_REJECTED = 'entities/fetchByIdIfNeeded/rejected'

const initialEntityMetaState = {
  lastFetchedListAt: null, // Timestamp: last time a full list of this entity type was fetched
  lastFetchedById: {}, // { [id: string]: number } Timestamp: last time this specific entity ID was fetched/updated
  loadingById: {}, // { [id: string]: 'pending' | 'succeeded' | 'failed' | 'idle' }
  errorById: {} // { [id: string]: string | null }
}

const initialState = {
  articles: {},
  users: {},
  baseWords: {},
  // Add other entity types here as needed
  // IMPORTANT: Ensure any entityType string used in actions/thunks has a corresponding key in _meta
  _meta: {
    articles: { ...initialEntityMetaState },
    users: { ...initialEntityMetaState },
    baseWords: { ...initialEntityMetaState }
    // Ensure all entity types you normalize have an entry here
  }
}

export default function entities(state = initialState, action) {
  let nextState = state // Start with current state
  let entitiesToMerge = null
  let wasSingleEntityFetch = false
  let singleEntityMetaInfo = null // To hold { entityType, id, timestamp } for single fetches

  // --- Handle fetchEntityByIdIfNeededThunk lifecycle ---
  if (action.type === FETCH_ENTITY_BY_ID_PENDING) {
    // Or use fetchEntityByIdIfNeededThunk.pending.type later
    const { entityType, id } = action.meta.arg
    if (state._meta[entityType]) {
      nextState = {
        ...state,
        _meta: {
          ...state._meta,
          [entityType]: {
            ...state._meta[entityType],
            loadingById: {
              ...state._meta[entityType].loadingById,
              [id]: 'pending'
            },
            errorById: { ...state._meta[entityType].errorById, [id]: null }
          }
        }
      }
    }
  } else if (action.type === FETCH_ENTITY_BY_ID_FULFILLED) {
    // Or use .fulfilled.type
    const { entityType, id } = action.meta.arg
    if (action.payload && action.payload.entities) {
      // payload is { result, entities } or null
      entitiesToMerge = action.payload.entities // These entities already have _lastFetchedAt
      wasSingleEntityFetch = true
      singleEntityMetaInfo = { entityType, id, timestamp: Date.now() } // Use current time for fulfilled
    }
    if (state._meta[entityType]) {
      nextState = {
        ...nextState,
        _meta: {
          ...nextState._meta,
          [entityType]: {
            ...nextState._meta[entityType],
            loadingById: {
              ...nextState._meta[entityType].loadingById,
              [id]: 'succeeded'
            }
            // errorById[id] should be null from pending, or cleared if needed
          }
        }
      }
    }
  } else if (action.type === FETCH_ENTITY_BY_ID_REJECTED) {
    // Or use .rejected.type
    const { entityType, id } = action.meta.arg
    if (state._meta[entityType]) {
      nextState = {
        ...state,
        _meta: {
          ...state._meta,
          [entityType]: {
            ...state._meta[entityType],
            loadingById: {
              ...state._meta[entityType].loadingById,
              [id]: 'failed'
            },
            errorById: {
              ...state._meta[entityType].errorById,
              [id]: action.payload || action.error?.message || 'Failed'
            }
          }
        }
      }
    }
  }

  // --- Generic Entity Merging (from lists or other direct entity payloads) ---
  if (
    !entitiesToMerge &&
    action.response?.entities &&
    Object.keys(action.response.entities).length > 0
  ) {
    entitiesToMerge = action.response.entities // From createApiRequestThunk (pagination HOC)
  } else if (
    !entitiesToMerge &&
    [
      LOGIN_SUCCESS,
      SOCIAL_LOGIN_SUCCESS,
      INITIALIZE_AUTH_SUCCESS,
      fetchSavedItemsThunk.fulfilled.type
    ].includes(action.type) &&
    action.payload?.entities &&
    Object.keys(action.payload.entities).length > 0
  ) {
    entitiesToMerge = action.payload.entities // From custom thunks like auth, savedItems
  }

  if (entitiesToMerge) {
    let tempMetaUpdates = {} // Accumulate meta updates for entity types involved in this merge

    for (const [entityType, entityMap] of Object.entries(entitiesToMerge)) {
      if (
        nextState[entityType] !== undefined ||
        initialState[entityType] !== undefined
      ) {
        // Check if entity type is known
        // The entities in entityMap (from createApiRequestThunk or fetchEntityByIdIfNeededThunk)
        // should already have _lastFetchedAt set by the thunk before normalization.
        nextState = {
          ...nextState,
          [entityType]: mergeEntities(nextState[entityType] || {}, entityMap)
        }

        // Update lastFetchedListAt heuristically if not a single entity fetch.
        // More precise updates to lastFetchedListAt might come from pagination reducers or specific list actions.
        if (!wasSingleEntityFetch && nextState._meta[entityType]) {
          if (!tempMetaUpdates[entityType]) tempMetaUpdates[entityType] = {}
          tempMetaUpdates[entityType].lastFetchedListAt = Date.now()
        }
      } else {
        console.warn(
          `Entities Reducer: Received entities for unknown type "${entityType}". Ensure it's in initialState and _meta.`
        )
      }
    }

    // Apply accumulated meta updates
    if (Object.keys(tempMetaUpdates).length > 0) {
      let newOverallMeta = { ...nextState._meta }
      for (const entityType in tempMetaUpdates) {
        newOverallMeta[entityType] = {
          ...newOverallMeta[entityType],
          ...tempMetaUpdates[entityType]
        }
      }
      nextState = { ...nextState, _meta: newOverallMeta }
    }
  }

  // If it was a single entity fetch and successful (handled by fetchEntityByIdIfNeededThunk.fulfilled),
  // update its specific lastFetchedById for that entity.
  if (
    wasSingleEntityFetch &&
    singleEntityMetaInfo &&
    nextState._meta[singleEntityMetaInfo.entityType]
  ) {
    nextState = {
      ...nextState,
      _meta: {
        ...nextState._meta,
        [singleEntityMetaInfo.entityType]: {
          ...nextState._meta[singleEntityMetaInfo.entityType],
          lastFetchedById: {
            ...nextState._meta[singleEntityMetaInfo.entityType].lastFetchedById,
            [singleEntityMetaInfo.id]: singleEntityMetaInfo.timestamp
          }
        }
      }
    }
  }

  // --- Handle explicit removal ---
  // (Example: action from a withPaginationEntityAction HOC for DELETE)
  if (
    action.meta?.entityName &&
    action.meta?.itemId &&
    action.meta?.requestStatus === 'fulfilled' &&
    (action.meta?.verb === 'DELETE' || action.meta?.operation === 'delete')
  ) {
    const entityType = action.meta.entityName
    const itemIdsToRemove = Array.isArray(action.meta.itemId)
      ? action.meta.itemId
      : [action.meta.itemId]

    nextState = removeEntity(nextState, entityType, itemIdsToRemove) // removeEntity should only affect the main entity store part

    // Also clear _meta for the removed entities
    if (nextState._meta[entityType]) {
      const currentMetaForType = nextState._meta[entityType]
      const newLoadingById = { ...currentMetaForType.loadingById }
      const newErrorById = { ...currentMetaForType.errorById }
      const newLastFetchedById = { ...currentMetaForType.lastFetchedById }

      itemIdsToRemove.forEach(id => {
        delete newLoadingById[id]
        delete newErrorById[id]
        delete newLastFetchedById[id]
      })
      nextState = {
        ...nextState,
        _meta: {
          ...nextState._meta,
          [entityType]: {
            ...currentMetaForType,
            loadingById: newLoadingById,
            errorById: newErrorById,
            lastFetchedById: newLastFetchedById
          }
        }
      }
    }
  }
  return nextState
}
