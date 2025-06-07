// src/features/entities/entityActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { RootState, AppDispatch } from '@store/store'
import { apiClient } from '@lib/api'
import { normalize, Schema } from 'normalizr'
import { FetchPolicy } from '@pagination/types' // Assuming FetchPolicy is defined here or move definition
import { ApiError } from '@lib/ApiError'
import {
  selectEntity,
  selectEntityLastFetchedTimestamp,
  selectEntityLoadingStatus
} from './entitySelectors' // Assuming selectors are in the same feature folder

// Define a reasonable stale threshold (e.g., 5 minutes)
export const DEFAULT_STALE_THRESHOLD_MS = 5 * 60 * 1000

export interface FetchEntityByIdParams {
  entityType: keyof Omit<RootState['entities'], '_meta'> // e.g., 'articles', 'users'
  id: string
  endpoint: string // Full endpoint, e.g., `/news/articles/${id}`
  schema: Schema // Normalizr schema for the single entity
  fetchPolicy?: FetchPolicy
  forceRefresh?: boolean // To explicitly bypass cache checks
  staleThresholdMs?: number // Override default staleness
}

// Thunk return type: Normalized data, or null if cache is hit and no network call made
// The entities part of the payload will be handled by entitiesReducer.
// The result part (the ID) can be useful for some callers.
export const fetchEntityByIdIfNeededThunk = createAsyncThunk<
  { result: string | number; entities: Record<string, any> } | null,
  FetchEntityByIdParams,
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'entities/fetchByIdIfNeeded', // This action type prefix is used by entitiesReducer
  async (params, { getState, dispatch, rejectWithValue }) => {
    const {
      entityType,
      id,
      endpoint,
      schema,
      fetchPolicy = 'cache-first',
      forceRefresh = false,
      staleThresholdMs = DEFAULT_STALE_THRESHOLD_MS
    } = params

    const state = getState()
    const existingEntity = selectEntity(state, entityType, id)
    const lastFetchedAt = selectEntityLastFetchedTimestamp(
      state,
      entityType,
      id
    )
    const currentLoadingStatus = selectEntityLoadingStatus(
      state,
      entityType,
      id
    )

    if (currentLoadingStatus === 'pending' && !forceRefresh) {
      console.log(
        `[Cache] Fetch for ${entityType}:${id} already in progress. Skipping.`
      )
      // If we want the caller to await the existing promise, this gets more complex.
      // For now, thunk effectively no-ops if already pending. Hook using this should reflect loading.
      return null
    }

    const isStale =
      !lastFetchedAt || Date.now() - lastFetchedAt > staleThresholdMs

    // Decision to use cache or fetch:
    let shouldFetchNetwork = false

    if (forceRefresh) {
      shouldFetchNetwork = true
    } else {
      switch (fetchPolicy) {
        case 'cache-first':
          if (!existingEntity || isStale) {
            shouldFetchNetwork = true
          } else {
            console.log(
              `[Cache] Fresh entity ${entityType}:${id} found. Policy: ${fetchPolicy}.`
            )
          }
          break
        case 'cache-and-network':
          shouldFetchNetwork = true // Always fetch, UI uses cache first
          if (existingEntity)
            console.log(
              `[Cache] Entity ${entityType}:${id} found, will also fetch network. Policy: ${fetchPolicy}.`
            )
          else
            console.log(
              `[API] Entity ${entityType}:${id} not in cache, fetching. Policy: ${fetchPolicy}.`
            )
          break
        case 'network-only':
          shouldFetchNetwork = true
          break
        case 'cache-only':
          if (!existingEntity) {
            console.warn(
              `[Cache] Entity ${entityType}:${id} not found with cache-only policy.`
            )
            // Optionally reject or return an indicator of cache miss
            return rejectWithValue(
              `Entity ${entityType}:${id} not found in cache (cache-only).`
            )
          }
          if (isStale) {
            console.warn(
              `[Cache] Entity ${entityType}:${id} is stale with cache-only policy.`
            )
            // Decide: return stale data or reject? For now, let hook return stale data.
            // Thunk itself doesn't "return" the cached data, the hook/selector does.
          }
          shouldFetchNetwork = false // Do not fetch from network
          break
        default: // Defaults to cache-first
          if (!existingEntity || isStale) shouldFetchNetwork = true
          break
      }
    }

    if (!shouldFetchNetwork) {
      // If existingEntity is present, it will be used by the component via selector.
      // If not, and policy was cache-only, an error might have been thrown or selector returns undefined.
      return null // Thunk action is complete, no network call made or needed based on policy.
    }

    console.log(
      `[API] Fetching entity ${entityType}:${id}. Endpoint: ${endpoint}. Stale: ${isStale}, Force: ${forceRefresh}, Policy: ${fetchPolicy}`
    )
    try {
      const rawData = await apiClient.get<any>(endpoint, dispatch)

      if (!rawData && rawData !== null) {
        // API returned undefined, or empty response where data was expected
        console.warn(
          `[API] No data returned for ${entityType}:${id} from ${endpoint}.`
        )
        // This might mean the entity was deleted on the backend.
        // Dispatch an action to remove it from the local cache if desired.
        // For now, the fulfilled action will have empty entities for this ID.
        // entitiesReducer could interpret this as a signal to remove if payload is { result: id, entities: { [entityType]: { [id]: undefined } } }
        return { result: id, entities: { [entityType]: { [id]: undefined } } } // Signal no data / potential removal
      }
      if (rawData === null && schema) {
        // API explicitly returned null (e.g. resource not found, but not an error status)
        console.log(
          `[API] Null data returned for ${entityType}:${id} from ${endpoint}. Entity may not exist.`
        )
        return { result: id, entities: { [entityType]: { [id]: null } } } // Signal explicit null
      }

      // Ensure dataToNormalize is the actual entity object, not an array or nested structure,
      // as this thunk is for fetching a SINGLE entity by ID.
      // The rawData from apiClient.get should be the direct object.
      const dataToNormalize = rawData

      const normalized = normalize(
        dataToNormalize
          ? { ...dataToNormalize, _lastFetchedAt: Date.now() }
          : null, // Add timestamp only if data exists
        schema
      )

      // Ensure entities object is not undefined even if normalization result is minimal
      const entities = normalized.entities || { [entityType]: {} }
      if (!entities[entityType] && dataToNormalize) {
        // If schema didn't produce this type but data existed
        entities[entityType] = {} // Ensure the entity type key exists
      }
      if (dataToNormalize === null && !entities[entityType]?.[id]) {
        // If API returned null, ensure the entity is set to null in the entities map
        if (!entities[entityType]) entities[entityType] = {}
        entities[entityType][id] = null
      }

      return { result: normalized.result as string | number, entities }
    } catch (error: any) {
      let message = `Failed to fetch ${entityType}:${id}.`
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      console.error(`[API] Error fetching ${entityType}:${id}:`, message, error)
      return rejectWithValue(message)
    }
  }
  // Removed the 'condition' option for multiple inflight requests here.
  // The 'loadingById' status check at the beginning of the thunk serves a similar purpose.
  // For more advanced inflight request management, a dedicated system or RTK Query is better.
)

// You would also update your entitiesReducer to use these actual action types:
// fetchEntityByIdIfNeededThunk.pending.type
// fetchEntityByIdIfNeededThunk.fulfilled.type
// fetchEntityByIdIfNeededThunk.rejected.type
