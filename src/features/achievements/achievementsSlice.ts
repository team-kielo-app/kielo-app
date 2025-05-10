// src/features/achievements/achievementsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AchievementsState, EarnedAchievement } from './types'
import { fetchEarnedAchievementsThunk } from './achievementsActions'
import { Status } from '@types'

const initialState: AchievementsState = {
  earnedAchievements: [],
  status: 'idle',
  error: null
}

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearAchievements(state) {
      // e.g., on logout
      state.earnedAchievements = []
      state.status = 'idle'
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEarnedAchievementsThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchEarnedAchievementsThunk.fulfilled,
        (state, action: PayloadAction<EarnedAchievement[]>) => {
          state.status = 'succeeded'
          state.earnedAchievements = action.payload
        }
      )
      .addCase(fetchEarnedAchievementsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
  }
})

export const { clearAchievements } = achievementsSlice.actions
export default achievementsSlice.reducer

// Selectors
export const selectEarnedAchievements = (
  state: RootState
): EarnedAchievement[] => state.achievements.earnedAchievements
export const selectAchievementsStatus = (state: RootState): Status =>
  state.achievements.status
