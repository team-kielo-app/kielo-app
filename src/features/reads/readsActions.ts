import { createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '@lib/api'
import { AppDispatch } from '@store/store'
import { ApiError } from '@lib/ApiError'
import { ReadArticle, ReadArticleListResponse, MarkReadPayload } from './types'

// Thunk for fetching read articles list
export const fetchReadsThunk = createAsyncThunk<
  ReadArticle[], // Return type
  void, // Argument type
  { dispatch: AppDispatch; rejectValue: string }
>('reads/fetch', async (_, { dispatch, rejectWithValue }) => {
  try {
    // Assuming the API returns { "articles": [...] }
    const response = await apiClient.get<ReadArticleListResponse>(
      '/me/reads',
      dispatch
    )
    return response.articles
  } catch (error: any) {
    let message = 'Failed to fetch read articles. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue(message)
  }
})

// Thunk for marking an article as read
export const markArticleReadThunk = createAsyncThunk<
  { message: string; article_version_id: string }, // Return type
  MarkReadPayload, // Argument type
  {
    dispatch: AppDispatch
    rejectValue: { message: string; article_version_id: string }
  }
>('reads/markRead', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const response = await apiClient.post<{ message: string }>(
      '/me/reads',
      payload,
      dispatch
    )
    return { ...response, article_version_id: payload.article_version_id }
  } catch (error: any) {
    let message = 'Failed to mark article as read. Please try again.'
    if (error instanceof ApiError) {
      message =
        error.data?.detail || error.data?.message || error.message || message
    } else if (error.message) {
      message = error.message
    }
    return rejectWithValue({
      message,
      article_version_id: payload.article_version_id
    })
  }
})
