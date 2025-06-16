import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import type { AppDispatch, RootState } from '@store/store'
import type { ChallengesState, DailyChallenge } from './types'
import { ApiError } from '@lib/ApiError'

const initialState: ChallengesState = {
  currentDailyChallenge: null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null
}

export const fetchDailyChallengeThunk = createAsyncThunk<
  DailyChallenge,
  { date?: string } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('challenges/fetchDaily', async (args, { dispatch, rejectWithValue }) => {
  try {
    const queryParams = args?.date ? `?date=${args.date}` : ''
    const response = await apiClient.get<DailyChallenge>(
      `/me/challenges/daily${queryParams}`,
      dispatch
    )
    return response
  } catch (error: any) {
    const message =
      error instanceof ApiError
        ? error.data?.detail || error.message
        : error.message || 'Failed to fetch daily challenge.'
    return rejectWithValue(message)
  }
})

export const updateDailyChallengeStatusThunk = createAsyncThunk<
  DailyChallenge,
  {
    challengeId: string
    newStatus: 'started' | 'in_progress' | 'completed' | 'skipped'
  },
  { dispatch: AppDispatch; rejectValue: string }
>(
  'challenges/updateStatus',
  async ({ challengeId, newStatus }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.put<DailyChallenge>(
        `/me/challenges/${challengeId}/status`,
        { new_status: newStatus },
        dispatch
      )
      return response
    } catch (error: any) {
      const message =
        error instanceof ApiError
          ? error.data?.detail || error.message
          : error.message || 'Failed to update challenge status.'
      return rejectWithValue(message)
    }
  }
)

const challengesSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    clearDailyChallenge(state) {
      state.currentDailyChallenge = null
      state.status = 'idle'
      state.error = null
    },
    markChallengeSectionCompleted(
      state,
      action: PayloadAction<{ sectionArrayIndex: number }>
    ) {
      if (
        state.currentDailyChallenge &&
        state.currentDailyChallenge.sections.length >
          action.payload.sectionArrayIndex &&
        action.payload.sectionArrayIndex >= 0
      ) {
        state.currentDailyChallenge.sections =
          state.currentDailyChallenge.sections.map((section, index) => {
            if (index === action.payload.sectionArrayIndex) {
              return { ...section, is_completed: true }
            }
            return section
          })
      }
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDailyChallengeThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchDailyChallengeThunk.fulfilled,
        (state, action: PayloadAction<DailyChallenge>) => {
          state.currentDailyChallenge = {
            ...action.payload,
            sections: action.payload.sections.map(s => ({
              ...s,
              is_completed: s.is_completed || false
            }))
          }
          state.status = 'succeeded'
        }
      )
      .addCase(fetchDailyChallengeThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error.'
      })
      .addCase(updateDailyChallengeStatusThunk.pending, state => {
        state.updateStatus = 'loading'
        state.updateError = null
      })
      .addCase(
        updateDailyChallengeStatusThunk.fulfilled,
        (state, action: PayloadAction<DailyChallenge>) => {
          state.currentDailyChallenge = action.payload
          state.updateStatus = 'succeeded'
        }
      )
      .addCase(updateDailyChallengeStatusThunk.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.updateError = action.payload ?? 'Unknown error.'
      })
  }
})

export const { clearDailyChallenge, markChallengeSectionCompleted } =
  challengesSlice.actions
export default challengesSlice.reducer

export const selectCurrentDailyChallenge = (
  state: RootState
): DailyChallenge | null => state.challenges.currentDailyChallenge
export const selectDailyChallengeFetchStatus = (
  state: RootState
): ApiStatusType => state.challenges.status
export const selectDailyChallengeFetchError = (
  state: RootState
): string | null => state.challenges.error
export const selectDailyChallengeUpdateStatus = (
  state: RootState
): ApiStatusType => state.challenges.updateStatus
