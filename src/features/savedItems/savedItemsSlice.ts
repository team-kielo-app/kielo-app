import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SavedItemsState, SavedItemReference, ApiSavedItem } from './types'
import {
  fetchSavedItemsThunk,
  saveItemThunk,
  unsaveItemThunk
} from './savedItemsActions'
import type { RootState } from '@/store/store'
import type { ApiStatusType } from '@lib/api.d'
import { Article } from '@features/articles/types'

const initialState: SavedItemsState = {
  items: [],
  status: 'idle',
  error: null
}

const savedItemsSlice = createSlice({
  name: 'savedItems',
  initialState,
  reducers: {
    clearSavedItems(state) {
      // e.g., on logout
      state.items = []
      state.status = 'idle'
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      // Fetching List
      .addCase(fetchSavedItemsThunk.pending, state => {
        state.status = 'loading'
        state.error = null // Clear previous list errors
      })
      .addCase(
        fetchSavedItemsThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ result: SavedItemReference[]; entities: any }>
        ) => {
          state.status = 'succeeded'
          state.items = action.payload.result
        }
      )
      .addCase(fetchSavedItemsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
      // Saving Item (Optional: Optimistic update or just refetch list after)
      .addCase(saveItemThunk.pending, (state, action) => {
        // Optional: Indicate saving state for the specific item
        console.log('Saving item pending:', action.meta.arg.item_id)
      })
      .addCase(saveItemThunk.fulfilled, (state, action) => {
        console.log('Item saved:', action.payload.item_id)
        const newItemRef: SavedItemReference = {
          item_id: action.payload.item_id,
          item_type: action.payload.item_type,
          saved_at: new Date().toISOString() // Placeholder, ideally from server
        }
        // Add if not already present (idempotency)
        if (
          !state.items.find(
            i =>
              i.item_id === newItemRef.item_id &&
              i.item_type === newItemRef.item_type
          )
        ) {
          state.items.unshift(newItemRef) // Add to beginning
        }
      })
      .addCase(saveItemThunk.rejected, (state, action) => {
        console.error('Save item failed:', action.payload)
        // Show error via component's local state or a global system
      })
      // Unsacing Item (Remove item from list if successful)
      .addCase(unsaveItemThunk.pending, (state, action) => {
        console.log('Unsacing item pending:', action.meta.arg.item_id)
      })
      .addCase(unsaveItemThunk.fulfilled, (state, action) => {
        console.log('Item unsaved:', action.payload.item_id)
        // Remove the item from the local Redux list
        state.items = state.items.filter(
          item =>
            !(
              item.item_id === action.payload.item_id &&
              item.item_type === action.payload.item_type
            )
        )
      })
      .addCase(unsaveItemThunk.rejected, (state, action) => {
        console.error('Unsave item failed:', action.payload)
        // Show error via component's local state or a global system
      })
  }
})

export const { clearSavedItems } = savedItemsSlice.actions
export default savedItemsSlice.reducer

// Add Selectors
export const selectSavedItemReferences = (
  state: RootState
): SavedItemReference[] => state.savedItems.items
export const selectSavedItemsStatus = (state: RootState): ApiStatusType =>
  state.savedItems.status
export const selectIsItemSaved = (
  state: RootState,
  itemType: string,
  itemId: string
): boolean => {
  return state.savedItems.items.some(
    // This correctly checks if the reference exists
    item => item.item_type === itemType && item.item_id === itemId
  )
}
export const selectHydratedSavedArticles = (state: RootState): Article[] => {
  const savedArticleRefs = state.savedItems.items.filter(
    ref => ref.item_type === 'ArticleVersion'
  )
  const articlesById = state.entities.articles || {}
  return savedArticleRefs
    .map(ref => articlesById[ref.item_id])
    .filter(article => !!article) as Article[] // Filter out undefined and cast
}
