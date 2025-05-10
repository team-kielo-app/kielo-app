// src/features/savedItems/savedItemsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SavedItemsState, SavedItem } from './types'
import {
  fetchSavedItemsThunk,
  saveItemThunk,
  unsaveItemThunk
} from './savedItemsActions'

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
        (state, action: PayloadAction<SavedItem[]>) => {
          state.status = 'succeeded'
          state.items = action.payload
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
        // Option 1: Do nothing, rely on manual refetch of list later
        // Option 2: Add placeholder to list (complex if details needed immediately)
        // Option 3: Mark item as saved if details already exist (e.g., in article view) - Requires modification
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
export const selectAllSavedItems = (state: RootState): SavedItem[] =>
  state.savedItems.items
export const selectSavedItemsStatus = (state: RootState): Status =>
  state.savedItems.status
export const selectIsItemSaved = (
  state: RootState,
  itemType: string,
  itemId: string
): boolean => {
  return state.savedItems.items.some(
    item => item.item_type === itemType && item.item_id === itemId
  )
}
