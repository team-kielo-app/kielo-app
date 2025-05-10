// src/features/savedItems/savedItemsActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch, RootState } from '@store/store'
import { SavedItem, SaveItemPayload, UnsaveItemPayload } from './types'

// Thunk for fetching saved items
export const fetchSavedItemsThunk = createAsyncThunk<
  SavedItem[], // Return type
  { itemType?: string } | void, // Argument type (optional filter)
  { dispatch: AppDispatch; rejectValue: string }
>('savedItems/fetch', async (args, { dispatch, rejectWithValue }) => {
  try {
    const endpoint = args?.itemType
      ? `/me/saved-items?type=${args.itemType}`
      : '/me/saved-items'
    const response = await apiClient.get<{ items: SavedItem[] }>(
      endpoint,
      dispatch
    )
    return response.items // Assuming API returns { "items": [...] }
  } catch (error: any) {
    const message =
      error?.data?.error || error?.message || 'Failed to fetch saved items'
    return rejectWithValue(message)
  }
})

// Thunk for saving an item
export const saveItemThunk = createAsyncThunk<
  { message: string; item_id: string; item_type: string }, // Return type (include IDs for potential optimistic update)
  SaveItemPayload, // Argument type
  {
    dispatch: AppDispatch
    rejectValue: { message: string; item_id: string; item_type: string }
  } // Include IDs in rejection
>('savedItems/save', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/me/saved-items',
      payload,
      dispatch
    )
    // Return success message along with item info for potential state updates
    return {
      ...response,
      item_id: payload.item_id,
      item_type: payload.item_type
    }
  } catch (error: any) {
    const message =
      error?.data?.error || error?.message || 'Failed to save item'
    // Reject with message and item info
    return rejectWithValue({
      message,
      item_id: payload.item_id,
      item_type: payload.item_type
    })
  }
})

// Thunk for unsaving an item
export const unsaveItemThunk = createAsyncThunk<
  { item_id: string; item_type: string }, // Return type (just IDs to identify what was removed)
  UnsaveItemPayload, // Argument type
  {
    dispatch: AppDispatch
    rejectValue: { message: string; item_id: string; item_type: string }
  } // Include IDs in rejection
>('savedItems/unsave', async (payload, { dispatch, rejectWithValue }) => {
  try {
    // DELETE expects no body in response, status 204 indicates success
    await apiClient.delete<void>( // Expect void response type
      `/me/saved-items/${payload.item_type}/${payload.item_id}`,
      dispatch
    )
    // Return item info on success for reducer/UI update
    return { item_id: payload.item_id, item_type: payload.item_type }
  } catch (error: any) {
    // DELETE might return 404 if already unsaved, handle specific statuses if needed
    const message =
      error?.data?.error || error?.message || 'Failed to unsave item'
    // Reject with message and item info
    return rejectWithValue({
      message,
      item_id: payload.item_id,
      item_type: payload.item_type
    })
  }
})
