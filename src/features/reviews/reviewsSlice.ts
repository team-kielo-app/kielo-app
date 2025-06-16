import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import type { AppDispatch, RootState } from '@store/store'
import type {
  ReviewsState,
  ReviewItem,
  ReviewOutcomePayload,
  FetchReviewsApiResponse
} from './types'
import { ApiError } from '@lib/ApiError'

const initialState: ReviewsState = {
  items: [],
  status: 'idle',
  error: null,
  nextBatchAvailableAt: null,
  currentItemIndex: -1
}

export const fetchReviewsThunk = createAsyncThunk<
  FetchReviewsApiResponse,
  { limit?: number } | void,
  { dispatch: AppDispatch; rejectValue: string }
>('reviews/fetchReviews', async (args, { dispatch, rejectWithValue }) => {
  try {
    const queryParams = args?.limit ? `?limit=${args.limit}` : ''
    const response = await apiClient.get<FetchReviewsApiResponse>(
      `/me/reviews${queryParams}`,
      dispatch
    )
    return response
  } catch (error: any) {
    let message = 'Failed to fetch review items.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue(message)
  }
})

export const reportReviewOutcomeThunk = createAsyncThunk<
  { itemId: string; itemType: string },
  { item: ReviewItem; outcome: ReviewOutcomePayload },
  { dispatch: AppDispatch; rejectValue: { message: string; itemId: string } }
>(
  'reviews/reportOutcome',
  async ({ item, outcome }, { dispatch, rejectWithValue }) => {
    const { item_id: itemId, item_type: itemType } = item
    let endpoint = ''

    if (itemType === 'word') {
      endpoint = `/me/vocabulary/${itemId}/review-outcome`
    } else if (itemType === 'grammar') {
      endpoint = `/me/grammar-concepts/${itemId}/review-outcome`
    } else {
      return rejectWithValue({
        message: `Unsupported item type: ${itemType}`,
        itemId
      })
    }

    try {
      await apiClient.put<void>(endpoint, outcome, dispatch)
      return { itemId, itemType }
    } catch (error: any) {
      let message = 'Failed to report review outcome.'
      if (error instanceof ApiError) {
        message =
          error.data?.detail || error.data?.message || error.message || message
      } else if (error.message) {
        message = error.message
      }
      return rejectWithValue({ message, itemId })
    }
  }
)

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    startReviewSession(state) {
      if (state.items.length > 0) {
        state.currentItemIndex = 0
      } else {
        state.currentItemIndex = -1
      }
      state.status = state.items.length > 0 ? 'succeeded' : 'idle'
    },
    advanceReviewItem(state) {
      if (state.currentItemIndex < state.items.length - 1) {
        state.currentItemIndex += 1
      } else {
        state.currentItemIndex = -1
      }
    },
    clearReviews(state) {
      state.items = []
      state.status = 'idle'
      state.error = null
      state.nextBatchAvailableAt = null
      state.currentItemIndex = -1
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchReviewsThunk.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(
        fetchReviewsThunk.fulfilled,
        (state, action: PayloadAction<FetchReviewsApiResponse>) => {
          state.items = action.payload.items_to_review
          state.nextBatchAvailableAt = action.payload.next_batch_available_at
          state.status = 'succeeded'
          state.error = null
          if (state.items.length > 0) {
            state.currentItemIndex = 0
          } else {
            state.currentItemIndex = -1
          }
        }
      )
      .addCase(fetchReviewsThunk.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload ?? 'Unknown error fetching reviews.'
        state.items = []
        state.currentItemIndex = -1
      })
      .addCase(reportReviewOutcomeThunk.pending, (state, action) => {})
      .addCase(reportReviewOutcomeThunk.fulfilled, (state, action) => {})
      .addCase(reportReviewOutcomeThunk.rejected, (state, action) => {})
  }
})

export const { startReviewSession, advanceReviewItem, clearReviews } =
  reviewsSlice.actions
export default reviewsSlice.reducer

export const selectAllReviewItems = (state: RootState): ReviewItem[] =>
  state.reviews.items
export const selectCurrentReviewItem = (
  state: RootState
): ReviewItem | undefined => {
  if (
    state.reviews.currentItemIndex >= 0 &&
    state.reviews.items.length > state.reviews.currentItemIndex
  ) {
    return state.reviews.items[state.reviews.currentItemIndex]
  }
  return undefined
}
export const selectReviewStatus = (state: RootState): ApiStatusType =>
  state.reviews.status
export const selectReviewError = (state: RootState): string | null =>
  state.reviews.error
export const selectNextBatchAvailableAt = (state: RootState): string | null =>
  state.reviews.nextBatchAvailableAt
export const selectCurrentReviewItemIndex = (state: RootState): number =>
  state.reviews.currentItemIndex
export const selectTotalReviewItemsCount = (state: RootState): number =>
  state.reviews.items.length
export const selectIsReviewSessionActive = (state: RootState): boolean =>
  state.reviews.currentItemIndex !== -1 && state.reviews.items.length > 0
