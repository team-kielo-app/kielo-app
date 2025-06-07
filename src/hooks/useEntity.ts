// src/hooks/useEntity.ts
import { useEffect, useMemo } from 'react' // Added useMemo
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@store/store'
import { fetchEntityByIdIfNeededThunk } from '@features/entities/entityActions'
import { Schema } from 'normalizr'
import {
  selectEntityLoadingStatus,
  selectEntityError
} from '@features/entities/entitySelectors'
import { FetchPolicy } from '@pagination/types'

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes (already in entityActions, ensure consistency)

interface UseEntityOptions {
  fetchPolicy?: FetchPolicy
  forceRefresh?: boolean
  skip?: boolean
}

export function useEntity<T extends { _lastFetchedAt?: number }>( // Entity T now expected to have _lastFetchedAt
  entityType: keyof RootState['entities'], // Make this more specific if possible, excluding _meta
  id: string | undefined | null,
  schema: Schema,
  endpointGenerator: (entityId: string) => string,
  options?: UseEntityOptions
) {
  const dispatch = useDispatch<AppDispatch>()
  const {
    fetchPolicy = 'cache-first',
    forceRefresh = false,
    skip = false
  } = options || {}

  const entity = useSelector(
    (state: RootState) =>
      id
        ? (state.entities[entityType as string]?.[id] as T | undefined)
        : undefined // Cast entityType to string for indexing
  )

  const isLoading = useSelector((state: RootState) =>
    id
      ? selectEntityLoadingStatus(state, entityType as string, id) === 'pending'
      : false
  )
  const error = useSelector((state: RootState) =>
    id ? selectEntityError(state, entityType as string, id) : null
  )

  // Memoize endpoint to prevent unnecessary useEffect runs if endpointGenerator is inline
  const endpoint = useMemo(
    () => (id ? endpointGenerator(id) : undefined),
    [id, endpointGenerator]
  )

  useEffect(() => {
    if (!id || skip || !endpoint) {
      // If no ID, or skipped, or no endpoint, do nothing
      return
    }

    // Determine if a fetch should be attempted
    let shouldFetch = false
    const isStale =
      !entity?._lastFetchedAt ||
      Date.now() - (entity._lastFetchedAt || 0) > STALE_THRESHOLD_MS

    if (forceRefresh) {
      shouldFetch = true
    } else {
      switch (fetchPolicy) {
        case 'network-only':
          shouldFetch = true
          break
        case 'cache-and-network':
          shouldFetch = true // Always fetch, UI uses cache if available
          break
        case 'cache-first':
          if (!entity || isStale) {
            shouldFetch = true
          }
          break
        case 'cache-only':
          if (!entity) {
            // Optionally, if entity must exist and be fresh for cache-only:
            // if (!entity || isStale) { console.warn(`Cache-only: Entity ${entityType}:${id} not found or stale.`); }
            // For now, cache-only means "don't fetch if missing" rather than "error if missing".
          }
          break
        default:
          if (!entity || isStale) {
            // Default to cache-first like behavior
            shouldFetch = true
          }
      }
    }

    if (shouldFetch) {
      // The condition inside fetchEntityByIdIfNeededThunk already prevents duplicate inflight requests
      // for the same entity ID and type.
      console.log(
        `[useEntity] Attempting fetch for ${entityType}:${id}, Policy: ${fetchPolicy}, Stale: ${isStale}, Force: ${forceRefresh}`
      )
      dispatch(
        fetchEntityByIdIfNeededThunk({
          entityType: entityType as string, // Cast for safety if entityType is a broader keyof
          id,
          endpoint,
          schema,
          fetchPolicy, // Pass policy for thunk to also respect if it has more nuanced logic
          forceRefresh // Pass forceRefresh to thunk
        })
      )
    }
  }, [
    dispatch,
    entityType,
    id,
    schema,
    endpoint, // Memoized endpoint
    fetchPolicy,
    forceRefresh,
    skip,
    entity?._lastFetchedAt, // Re-check if lastFetchedAt changes (e.g. from another source)
    entity === undefined // Re-check if entity presence changes from defined to undefined
  ])

  // isLoading primarily reflects the direct fetch attempt by this hook or related thunk.
  // If fetchPolicy is cache-and-network and 'entity' is present, isLoading might be true
  // while the background fetch happens.
  return { data: entity, isLoading, error }
}
