import { ARTICLE_ARRAY, ARTICLE_SCHEMA_SINGLE } from '@entities/schemas'
import * as actionTypes from './articlesActionTypes'
import { withPaginationList } from '@pagination/actions'
import { createApiRequestThunk } from '@pagination/apiRequestThunkFactory'
import { selectArticlePagination } from './articlesSelectors' // Need selectors
import { ThunkAction } from 'redux-thunk' // Or use RTK types
import { RootState } from '@store/store'

// --- Action Creator for fetching Article LIST ---
export const fetchArticles = (
  ownerId: string,
  options?: { reset?: boolean; fetchNext?: boolean }
) => {
  // Create the specific API request thunk for articles
  const apiRequestThunk = createApiRequestThunk({
    types: [
      actionTypes.FETCH_ARTICLES_REQUEST,
      actionTypes.FETCH_ARTICLES_SUCCESS,
      actionTypes.FETCH_ARTICLES_FAILURE
    ],
    // Adapt endpoint based on ownerId (e.g., /users/{ownerId}/articles or /articles?ownerId=...)
    endpoint: `/news/articles`, // Adjust as needed
    verb: 'GET',
    schema: ARTICLE_ARRAY, // Use your defined normalizr schema
    transform: [res => res.articles] // Extract data if nested
  })

  // Use the HOC
  return withPaginationList<RootState>({
    apiRequestFunction: apiRequestThunk,
    getStatePaginationData: selectArticlePagination, // Selector for state.pagination
    paginationKey: ownerId,
    pageSize: 25 // Specific page size for articles
  })(options) // Pass options like { reset: true } or { fetchNext: true }
}

// --- Action Creator for fetching a SINGLE Article ---
export const fetchSingleArticle = (
  articleId: string,
  cb?: (err: Error | null, res?: any) => void
): ThunkAction<Promise<any>, RootState, unknown, any> => {
  const apiRequestThunk = createApiRequestThunk({
    types: [
      actionTypes.FETCH_SINGLE_ARTICLE_REQUEST,
      actionTypes.FETCH_SINGLE_ARTICLE_SUCCESS,
      actionTypes.FETCH_SINGLE_ARTICLE_FAILURE
    ],
    endpoint: `/news/articles/${articleId}`,
    verb: 'GET',
    schema: ARTICLE_SCHEMA_SINGLE, // Use your defined normalizr schema
    transform: [res => res],
    cb
  })
  // No pagination HOC needed, just dispatch the API request thunk directly
  // Pass an empty meta object or define specific meta if needed for the single fetch reducer logic
  return apiRequestThunk({
    meta: { entityName: 'articles', itemId: articleId }
  })
}
