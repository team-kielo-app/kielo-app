// src/features/lessons/lessonsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import type { AppDispatch, RootState } from '@store/store'
import type {
  LessonsState,
  LessonData,
  KieloSuggestedLessonsApiResponse
} from './types'
import { ApiError } from '@lib/ApiError'

// Response type from Kielo Backend for GET /api/v1/me/lessons/targeted
interface SuggestedLessonsApiResponse {
  user_id: string
  suggested_lessons: LessonData[]
}
// Response type from Kielo Backend for GET /api/v1/lessons/{lesson_id}
// This should match the LessonData structure expected by LessonPlayerScreen
// type LessonDetailsApiResponse = LessonData;

const initialState: LessonsState = {
  suggestedLessons: [],
  suggestedLessonsStatus: 'idle',
  suggestedLessonsError: null
  // No currentLessonData fields needed in Redux state
}

// --- Thunks ---
export const fetchSuggestedLessonsThunk = createAsyncThunk<
  LessonData[], // This is correct, as we want to store LessonData[] in the slice
  { max_suggestions?: number } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('lessons/fetchSuggested', async (args, { dispatch, rejectWithValue }) => {
  try {
    const queryParams = args?.max_suggestions
      ? `?max_suggestions=${args.max_suggestions}`
      : ''
    // The Kielo Backend endpoint /api/v1/me/lessons/targeted returns KieloSuggestedLessonsApiResponse
    const response = await apiClient.get<KieloSuggestedLessonsApiResponse>( // Use the correct API response type
      `/me/lessons/targeted${queryParams}`,
      dispatch
    )
    return response.suggested_lessons // Extract the array of LessonData
  } catch (error: any) {
    const message =
      error instanceof ApiError
        ? error.data?.detail || error.message
        : error.message || 'Failed to fetch suggested lessons.'
    return rejectWithValue(message)
  }
})

// --- Slice ---
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
      // Fetch Suggested Lessons
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

// --- Selectors ---
export const selectSuggestedLessons = (state: RootState): LessonData[] =>
  state.lessons.suggestedLessons
export const selectSuggestedLessonsStatus = (state: RootState): ApiStatusType =>
  state.lessons.suggestedLessonsStatus
export const selectCurrentLessonStatus = (state: RootState): ApiStatusType =>
  state.lessons.currentLessonStatus
export const selectCurrentLessonError = (state: RootState): string | null =>
  state.lessons.currentLessonError
