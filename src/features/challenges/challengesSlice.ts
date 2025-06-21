// src/features/challenges/challengesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import type { AppDispatch, RootState } from '@store/store'
import type {
  ChallengesState,
  DailyChallenge,
  DailyChallengeApiResponse
} from './types'
import { ApiError } from '@lib/ApiError'
import type { ApiStatusType } from '@lib/api.d'

const initialState: ChallengesState = {
  currentDailyChallenge: null,
  status: 'idle',
  error: null,
  updateStatus: 'idle',
  updateError: null
}

// --- POLLING HELPER ---
const POLLING_INTERVAL_MS = 3000
const MAX_POLLING_ATTEMPTS = 30 // 30 seconds timeout

async function pollForReadyResponse<T>(
  endpoint: string,
  dispatch: AppDispatch
): Promise<T> {
  let attempts = 0
  while (attempts < MAX_POLLING_ATTEMPTS) {
    const { response, body } = await apiClient.getWithResponse<T>(
      endpoint,
      dispatch
    )

    if (response.status === 200) {
      return body
    }

    if (response.status === 202) {
      console.log(
        `[Polling] Received 202 for ${endpoint}. Waiting ${POLLING_INTERVAL_MS}ms. Attempt ${
          attempts + 1
        }/${MAX_POLLING_ATTEMPTS}`
      )
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS))
      attempts++
    } else {
      throw new ApiError(
        `Unexpected status code ${response.status} during polling.`,
        response.status,
        body
      )
    }
  }
  throw new Error(
    'Challenge generation timed out. Please try again in a moment.'
  )
}

// --- THUNKS ---
export const fetchDailyChallengeThunk = createAsyncThunk<
  DailyChallenge, // We will transform the API response to this type before fulfilling
  { date?: string } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('challenges/fetchDaily', async (args, { dispatch, rejectWithValue }) => {
  try {
    const queryParams = args?.date ? `?date=${args.date}` : ''
    const endpoint = `/me/challenges/daily${queryParams}`

    // Poll for the API response which has the `sections_json` field
    const apiResponse = await pollForReadyResponse<DailyChallengeApiResponse>(
      endpoint,
      dispatch
    )

    // Transform the API response to match our state's structure
    const challengeForState: DailyChallenge = {
      ...apiResponse,
      sections: apiResponse.sections_json // Rename the field
    }

    return challengeForState
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
      // Assuming the PUT response might also use sections_json. If so, we transform it.
      // If it returns the final state shape directly, no transform is needed here.
      // Let's assume it returns the same API shape for consistency.
      const apiResponse = await apiClient.put<DailyChallengeApiResponse>(
        `/me/challenges/${challengeId}/status`,
        { new_status: newStatus },
        dispatch
      )
      const challengeForState: DailyChallenge = {
        ...apiResponse,
        sections: apiResponse.sections_json
      }
      return challengeForState
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
          // The payload is already in the correct `DailyChallenge` shape with `sections`
          state.currentDailyChallenge = {
            ...action.payload,
            sections: action.payload.sections.map(s => ({
              ...s,
              is_completed: s.is_completed || false // Ensure client-side flag is present
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
          // Payload is also the correct shape here
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
