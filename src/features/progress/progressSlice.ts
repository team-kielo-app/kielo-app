// src/features/progress/progressSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ProgressState, ProgressSummary } from './types'
import { fetchProgressThunk } from './progressActions'
import { Status } from '@types'

const initialState: ProgressState = {
  summary: null,
  status: 'idle',
  error: null
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearProgress(state) {
      // e.g., on logout
      state.summary = null
      state.status = 'idle'
      state.error = null
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProgressThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchProgressThunk.fulfilled,
        (state, action: PayloadAction<ProgressSummary>) => {
          state.status = 'succeeded'
          state.summary = action.payload
        }
      )
      .addCase(fetchProgressThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
  }
})

export const { clearProgress } = progressSlice.actions
export default progressSlice.reducer

// Selectors
export const selectProgressSummary = (
  state: RootState
): ProgressSummary | null => state.progress.summary
export const selectProgressStatus = (state: RootState): Status =>
  state.progress.status
