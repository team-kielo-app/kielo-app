import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import type { AppDispatch, RootState } from '@store/store'
import type {
  LessonsState,
  LessonData,
  KieloSuggestedLessonsApiResponse
} from './types'
import { ApiError } from '@lib/ApiError'
import type { ApiStatusType } from '@lib/api.d'

const POLLING_INTERVAL_MS = 3000
const MAX_POLLING_ATTEMPTS = 30

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
  throw new Error('Lesson generation timed out. Please try again in a moment.')
}

const initialState: LessonsState = {
  suggestedLessons: [],
  suggestedLessonsStatus: 'idle',
  suggestedLessonsError: null
}

export const fetchSuggestedLessonsThunk = createAsyncThunk<
  LessonData[],
  { max_suggestions?: number } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('lessons/fetchSuggested', async (args, { dispatch, rejectWithValue }) => {
  try {
    const queryParams = args?.max_suggestions
      ? `?max_suggestions=${args.max_suggestions}`
      : ''
    const endpoint = `/me/lessons/targeted${queryParams}`
    const response =
      await pollForReadyResponse<KieloSuggestedLessonsApiResponse>(
        endpoint,
        dispatch
      )
    return response.suggested_lessons
  } catch (error: any) {
    const message =
      error instanceof ApiError
        ? error.data?.detail || error.message
        : error.message || 'Failed to fetch suggested lessons.'
    return rejectWithValue(message)
  }
})

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearCurrentLesson(state) {
      state.currentLessonData = null
      state.currentLessonStatus = 'idle'
      state.currentLessonError = null
    },
    clearSuggestedLessons(state) {
      state.suggestedLessons = []
      state.suggestedLessonsStatus = 'idle'
      state.suggestedLessonsError = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSuggestedLessonsThunk.pending, state => {
        state.suggestedLessonsStatus = 'loading'
        state.suggestedLessonsError = null
      })
      .addCase(
        fetchSuggestedLessonsThunk.fulfilled,
        (state, action: PayloadAction<LessonData[]>) => {
          state.suggestedLessons = action.payload
          state.suggestedLessonsStatus = 'succeeded'
        }
      )
      .addCase(fetchSuggestedLessonsThunk.rejected, (state, action) => {
        state.suggestedLessonsStatus = 'failed'
        state.suggestedLessonsError = action.payload ?? 'Unknown error.'
      })
  }
})

export const { clearCurrentLesson, clearSuggestedLessons } =
  lessonsSlice.actions
export default lessonsSlice.reducer

export const selectSuggestedLessons = (state: RootState): LessonData[] =>
  state.lessons.suggestedLessons
export const selectSuggestedLessonsStatus = (state: RootState): ApiStatusType =>
  state.lessons.suggestedLessonsStatus
export const selectCurrentLessonStatus = (state: RootState): ApiStatusType =>
  state.lessons.currentLessonStatus
export const selectCurrentLessonError = (state: RootState): string | null =>
  state.lessons.currentLessonError
