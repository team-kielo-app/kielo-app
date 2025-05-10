// src/features/progress/progressActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch } from '@store/store'
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
    const message =
      error?.data?.error || error?.message || 'Failed to fetch progress summary'
    return rejectWithValue(message)
  }
})
