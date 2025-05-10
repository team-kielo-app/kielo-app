// src/features/achievements/achievementsActions.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch } from '@store/store'
import { EarnedAchievement, AchievementListResponse } from './types'

// Thunk for fetching earned achievements list
export const fetchEarnedAchievementsThunk = createAsyncThunk<
  EarnedAchievement[], // Return type
  void, // Argument type
  { dispatch: AppDispatch; rejectValue: string }
>('achievements/fetchEarned', async (_, { dispatch, rejectWithValue }) => {
  try {
    // Assuming the API returns { "achievements": [...] }
    const response = await apiClient.get<AchievementListResponse>(
      '/me/achievements',
      dispatch
    )
    return response.achievements
  } catch (error: any) {
    const message =
      error?.data?.error ||
      error?.message ||
      'Failed to fetch earned achievements'
    return rejectWithValue(message)
  }
})
