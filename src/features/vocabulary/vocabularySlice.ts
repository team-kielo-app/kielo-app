// src/features/vocabulary/vocabularySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { VocabularyState, UserVocabularyEntry } from './types'
import {
  fetchVocabularyThunk,
  updateVocabularyStatusThunk
} from './vocabularyActions'
import { ApiStatusType } from '@lib/api.d'
import { RootState } from '@/store/store'

const initialState: VocabularyState = {
  entries: [],
  status: 'idle',
  error: null,
  updateStatus: {},
  updateError: {}
}

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    clearVocabulary(state) {
      // e.g., on logout
      state.entries = []
      state.status = 'idle'
      state.error = null
      state.updateStatus = {}
      state.updateError = {}
    }
  },
  extraReducers: builder => {
    builder
      // Fetching List
      .addCase(fetchVocabularyThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchVocabularyThunk.fulfilled,
        (state, action: PayloadAction<UserVocabularyEntry[]>) => {
          state.status = 'succeeded'
          state.entries = action.payload
        }
      )
      .addCase(fetchVocabularyThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
      // Updating Status
      .addCase(updateVocabularyStatusThunk.pending, (state, action) => {
        const baseWordId = action.meta.arg.base_word_id
        state.updateStatus[baseWordId] = 'loading'
        state.updateError[baseWordId] = null
      })
      .addCase(
        updateVocabularyStatusThunk.fulfilled,
        (state, action: PayloadAction<UserVocabularyEntry>) => {
          const updatedEntry = action.payload
          state.updateStatus[updatedEntry.base_word_id] = 'succeeded'
          // Update the entry in the list
          const index = state.entries.findIndex(
            e => e.base_word_id === updatedEntry.base_word_id
          )
          if (index !== -1) {
            state.entries[index] = updatedEntry
          } else {
            // Optionally add it if it wasn't in the list (e.g., first time interaction)
            state.entries.push(updatedEntry)
          }
        }
      )
      .addCase(updateVocabularyStatusThunk.rejected, (state, action) => {
        const baseWordId = action.meta.arg.base_word_id
        state.updateStatus[baseWordId] = 'failed'
        state.updateError[baseWordId] =
          action.payload?.message ?? 'Unknown error'
      })
  }
})

export const { clearVocabulary } = vocabularySlice.actions
export default vocabularySlice.reducer

// Selectors
export const selectAllVocabulary = (state: RootState): UserVocabularyEntry[] =>
  state.vocabulary.entries
export const selectVocabularyListStatus = (state: RootState): ApiStatusType =>
  state.vocabulary.status
export const selectVocabularyUpdateStatus = (
  state: RootState,
  baseWordId: string
): StaApiStatusTypetus | undefined => state.vocabulary.updateStatus[baseWordId]
export const selectVocabularyEntry = (
  state: RootState,
  baseWordId: string
): UserVocabularyEntry | undefined => {
  return state.vocabulary.entries.find(e => e.base_word_id === baseWordId)
}
