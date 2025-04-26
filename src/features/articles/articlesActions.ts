// --- Specific Article Actions ---
// src/features/articles/articlesActions.ts
import { ARTICLE_ARRAY } from '@entities/schemas' // Assuming schemas are defined
import { mapArticles } from '@entities/transforms' // Assuming schemas are defined
import * as actionTypes from './articlesActionTypes'
import { withPaginationList } from '@pagination/actions'
import { createApiRequestThunk } from '@pagination/apiRequestThunkFactory'
import { selectArticlePagination } from './articlesSelectors' // Need selectors
import { ThunkAction } from 'redux-thunk' // Or use RTK types

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
    transform: [res => res.articles, mapArticles] // Extract data if nested
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

    schema: ARTICLE_ARRAY, // Use your defined normalizr schema
    transform: [res => [res], mapArticles], // Extract data if nested
    cb
  })
  // No pagination HOC needed, just dispatch the API request thunk directly
  // Pass an empty meta object or define specific meta if needed for the single fetch reducer logic
  return apiRequestThunk({
    meta: { entityName: 'articles', itemId: articleId }
  })
}

// --- Action Creator for DELETING an Article ---
// export const deleteArticle = (articleId: string, ownerId?: string, cb?: (err: Error | null, res?: any) => void) => {
//     const entityName = 'articles';
//     // Optional: Determine which pagination list(s) this might affect
//     const paginationKey = ownerId ? `articles_by_owner_${ownerId}` : undefined;

//     const apiRequestThunk = createApiRequestThunk({
//         types: [actionTypes.DELETE_ARTICLE_REQUEST, actionTypes.DELETE_ARTICLE_SUCCESS, actionTypes.DELETE_ARTICLE_FAILURE], // Define these types
//         endpoint: `/articles/${articleId}`,
//         verb: 'DELETE',
//         cb,
//         // No schema needed usually for delete, response might be empty or just { success: true }
//     });

//     // Use the entity action HOC
//     return withPaginationEntityAction<RootState>({
//         apiRequestFunction: apiRequestThunk,
//         entityName,
//         itemId: articleId,
//         verb: 'DELETE',
//         paginationKey, // Pass the key so the pagination reducer can remove the ID
//     })(); // No body needed for DELETE
// }
