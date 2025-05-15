// src/features/reads/readsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ReadsState, ReadArticle } from './types'
import { fetchReadsThunk, markArticleReadThunk } from './readsActions'
import { RootState } from '@/store/store'
import { ApiStatusType } from '@lib/api.d'

const initialState: ReadsState = {
  readArticles: [],
  status: 'idle',
  error: null,
  markReadStatus: {},
  markReadError: {}
}

const readsSlice = createSlice({
  name: 'reads',
  initialState,
  reducers: {
    clearReads(state) {
      // e.g., on logout
      state.readArticles = []
      state.status = 'idle'
      state.error = null
      state.markReadStatus = {}
      state.markReadError = {}
    }
  },
  extraReducers: builder => {
    builder
      // Fetching List
      .addCase(fetchReadsThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchReadsThunk.fulfilled,
        (state, action: PayloadAction<ReadArticle[]>) => {
          state.status = 'succeeded'
          state.readArticles = action.payload
        }
      )
      .addCase(fetchReadsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error'
      })
      // Marking as Read
      .addCase(markArticleReadThunk.pending, (state, action) => {
        const articleId = action.meta.arg.article_version_id
        state.markReadStatus[articleId] = 'loading'
        state.markReadError[articleId] = null
      })
      .addCase(markArticleReadThunk.fulfilled, (state, action) => {
        const articleId = action.payload.article_version_id
        state.markReadStatus[articleId] = 'succeeded'
        // Optional: Add to list immediately if not already there,
        // but usually relying on a refetch of the list is simpler.
        // If optimistic update needed:
        // const exists = state.readArticles.some(a => a.article_version_id === articleId);
        // if (!exists) { state.readArticles.unshift({ article_version_id: articleId, read_at: new Date().toISOString() }); }
      })
      .addCase(markArticleReadThunk.rejected, (state, action) => {
        const articleId = action.meta.arg.article_version_id
        state.markReadStatus[articleId] = 'failed'
        state.markReadError[articleId] =
          action.payload?.message ?? 'Unknown error'
      })
  }
})

export const { clearReads } = readsSlice.actions
export default readsSlice.reducer

// Selectors
export const selectAllReadArticles = (state: RootState): ReadArticle[] =>
  state.reads.readArticles
export const selectReadsListStatus = (state: RootState): ApiStatusType =>
  state.reads.status
export const selectIsArticleRead = (
  state: RootState,
  articleVersionId: string
): boolean => {
  return state.reads.readArticles.some(
    a => a.article_version_id === articleVersionId
  )
}
export const selectMarkReadStatus = (
  state: RootState,
  articleVersionId: string
): ApiStatusType | undefined => state.reads.markReadStatus[articleVersionId]
