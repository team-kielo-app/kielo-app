// src/features/articles/articlesReducer.ts
import { paginate } from "@pagination/reducer";
import * as actionTypes from "./articlesActionTypes";

export const articlePaginationReducer = paginate({
  requestTypes: [actionTypes.FETCH_ARTICLES_REQUEST],
  successTypes: [actionTypes.FETCH_ARTICLES_SUCCESS],
  failureTypes: [actionTypes.FETCH_ARTICLES_FAILURE],
  // Define how to get the key from article list actions
  mapActionToKey: (action) => action.meta?.paginationKey,
  // Specify the field in the normalized response that holds the array of IDs/keys
  resultField: "result",
  // Specify the ID field within the result items if they are objects (used by uniqueObjectsConcatOrder)
  idField: "id", // Assuming your normalized articles have an 'id' field
});

// If you had other article-specific state (e.g., current single article view),
// you could combine reducers here. For now, just exporting the pagination part.
// export default combineReducers({
//    pagination: articlePaginationReducer,
//    // otherArticleState: otherReducer,
// });
// For simplicity with the root reducer structure, we export directly:
export default articlePaginationReducer;

