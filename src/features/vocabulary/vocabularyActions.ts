import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch } from '@store/store'
import {
  UserVocabularyEntry,
  VocabularyListResponse,
  UpdateVocabularyPayload
} from './types'
import { ApiError } from '@lib/ApiError'

// Thunk for fetching vocabulary list
export const fetchVocabularyThunk = createAsyncThunk<
  UserVocabularyEntry[], // Return type (the array of entries)
  { status?: VocabularyStatus } | void, // Argument (optional status filter)
  { dispatch: AppDispatch; rejectValue: string }
>('vocabulary/fetch', async (args, { dispatch, rejectWithValue }) => {
  try {
    const endpoint = args?.status
      ? `/me/vocabulary?status=${args.status}`
      : '/me/vocabulary'
    // Assuming the API returns { "vocabulary": [...] }
    const response = await apiClient.get<VocabularyListResponse>(
      endpoint,
      dispatch
    )
    return response.vocabulary
  } catch (error: any) {
    let message = 'Failed to fetch vocabulary. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue(message)
  }
})

// Thunk for updating a word's status
export const updateVocabularyStatusThunk = createAsyncThunk<
  UserVocabularyEntry, // Return the updated entry on success
  UpdateVocabularyPayload, // Argument
  {
    dispatch: AppDispatch
    rejectValue: { message: string; base_word_id: string }
  }
>('vocabulary/updateStatus', async (payload, { dispatch, rejectWithValue }) => {
  try {
    // API returns the updated UserVocabularyEntry
    const updatedEntry = await apiClient.put<UserVocabularyEntry>(
      '/me/vocabulary',
      payload,
      dispatch
    )
    return updatedEntry
  } catch (error: any) {
    let message = 'Failed to update vocabulary status. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue({ message, base_word_id: payload.base_word_id })
  }
})
