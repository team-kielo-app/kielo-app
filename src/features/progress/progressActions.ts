// src/features/progress/progressActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch } from '@store/store'
import { ApiError } from '@lib/ApiError'
import { ProgressSummary } from './types'

// Thunk for fetching progress summary
export const fetchProgressThunk = createAsyncThunk<
  ProgressSummary, // Return type
  void, // Argument type
  { dispatch: AppDispatch; rejectValue: string }
>('progress/fetch', async (_, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.get<ProgressSummary>(
      '/me/progress',
      dispatch
    )
    return response
  } catch (error: any) {
    let message = 'Failed to fetch progress summary. Please try again later.'
    if (error instanceof ApiError) {
      // You could customize message based on error.status or error.data
      // e.g., if (error.status === 403) message = "You don't have permission."
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue(message)
  }
})
