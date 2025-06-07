import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { normalize } from 'normalizr'
import { SAVED_ITEM_ARRAY_SCHEMA } from '@entities/schemas'
import { AppDispatch } from '@store/store'
import { ApiError } from '@lib/ApiError'
import type {
  ApiSavedItem,
  SaveItemPayload,
  UnsaveItemPayload,
  SavedItemReference
} from './types'

export const fetchSavedItemsThunk = createAsyncThunk<
  {
    result: Array<string | { item_id: string; item_type: string }>
    entities: any
  },
  { itemType?: string } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('savedItems/fetch', async (args, { dispatch, rejectWithValue }) => {
  try {
    const endpoint = args?.itemType
      ? `/me/saved-items?type=${args.itemType}`
      : '/me/saved-items'
    const response = await apiClient.get<{ items: ApiSavedItem[] }>(
      endpoint,
      dispatch
    )

    const normalizedData = normalize(response.items, SAVED_ITEM_ARRAY_SCHEMA)
    const savedItemReferences: SavedItemReference[] = response.items.map(
      apiItem => ({
        item_id: apiItem.item_id,
        item_type: apiItem.item_type,
        saved_at: apiItem.saved_at,
        notes: apiItem.notes
      })
    )

    return { result: savedItemReferences, entities: normalizedData.entities }
  } catch (error: any) {
    let message = 'Failed to fetch saved items. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue(message)
  }
})

export const saveItemThunk = createAsyncThunk<
  { message: string; item_id: string; item_type: string },
  SaveItemPayload,
  {
    dispatch: AppDispatch
    rejectValue: { message: string; item_id: string; item_type: string }
  }
>('savedItems/save', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/me/saved-items',
      payload,
      dispatch
    )
    return {
      ...response,
      item_id: payload.item_id,
      item_type: payload.item_type
    }
  } catch (error: any) {
    let message = 'Failed to save item. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue({
      message,
      item_id: payload.item_id,
      item_type: payload.item_type
    })
  }
})

export const unsaveItemThunk = createAsyncThunk<
  { item_id: string; item_type: string },
  UnsaveItemPayload,
  {
    dispatch: AppDispatch
    rejectValue: { message: string; item_id: string; item_type: string }
  }
>('savedItems/unsave', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await apiClient.delete<void>(
      `/me/saved-items/${payload.item_type}/${payload.item_id}`,
      dispatch
    )
    return { item_id: payload.item_id, item_type: payload.item_type }
  } catch (error: any) {
    let message = 'Failed to unsave item. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue({
      message,
      item_id: payload.item_id,
      item_type: payload.item_type
    })
  }
})
