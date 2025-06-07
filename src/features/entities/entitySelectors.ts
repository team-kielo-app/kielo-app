// src/features/entities/entitySelectors.ts (or wherever you keep them)
import { RootState } from '@store/store'
import { User } from '@features/auth/types' // Example type
import { Article } from '@features/articles/types' // Example type

// Generic selector for any entity type
export const selectEntity = <T extends { _lastFetchedAt?: number }>(
  state: RootState,
  entityType: keyof Omit<RootState['entities'], '_meta'>, // Exclude _meta from entityType choices
  id: string | undefined | null
): T | undefined => {
  if (!id || !state.entities[entityType]) {
    return undefined
  }
  return state.entities[entityType][id] as T | undefined
}

// Example specific selectors (can be built with createSelector for memoization)
export const selectUserById = (
  state: RootState,
  userId: string | undefined | null
): User | undefined => selectEntity<User>(state, 'users', userId)

export const selectArticleById = (
  state: RootState,
  articleId: string | undefined | null
): Article | undefined => selectEntity<Article>(state, 'articles', articleId)

// Meta Selectors
export const selectEntityMeta = (
  state: RootState,
  entityType: keyof RootState['entities']['_meta']
) => state.entities._meta[entityType]

export const selectEntityLoadingStatus = (
  state: RootState,
  entityType: keyof RootState['entities']['_meta'],
  id: string | undefined | null
): 'idle' | 'pending' | 'succeeded' | 'failed' => {
  if (!id) return 'idle'
  return state.entities._meta[entityType]?.loadingById[id] || 'idle'
}

export const selectEntityError = (
  state: RootState,
  entityType: keyof RootState['entities']['_meta'],
  id: string | undefined | null
): string | null => {
  if (!id) return null
  return state.entities._meta[entityType]?.errorById[id] || null
}

export const selectEntityLastFetchedTimestamp = (
  state: RootState,
  entityType: keyof RootState['entities']['_meta'],
  id: string | undefined | null
): number | null => {
  if (!id) return null
  return state.entities._meta[entityType]?.lastFetchedById[id] || null
}

export const selectEntityTypeLastFetchedListTimestamp = (
  state: RootState,
  entityType: keyof RootState['entities']['_meta']
): number | null => {
  return state.entities._meta[entityType]?.lastFetchedListAt || null
}
