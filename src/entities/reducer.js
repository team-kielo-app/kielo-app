// src/pagination/entities.js
// Assuming a utility for deep merging if needed, otherwise simple assign is often enough
// import { merge } from 'lodash';// --- REVISED: Using utils and improved structure ---
import { mergeEntities, removeEntity } from "./utils";

const initialState = {
  articles: {},
  // other entities like users, comments, etc. would go here
};

export default function entities(state = initialState, action) {
  // 1. Handle generic entity merging from ANY successful API response containing entities
  //    (Assumes responses normalized by normalizr are placed in action.response.entities)
  if (action.response?.entities) {
    let nextState = state;

    for (const [entityName, entityMap] of Object.entries(
      action.response.entities
    )) {
      if (state[entityName]) {
        // Only merge if the entity type exists in initial state
        nextState = {
          ...nextState,
          [entityName]: mergeEntities(state[entityName], entityMap),
        };
      }
    }
    // After merging, check if this action also implies removal (e.g., from a DELETE request meta)

    if (
      action.verb?.toLowerCase() === "delete" &&
      action.meta?.entityName &&
      action.meta?.itemId /* && action relates to a DELETE success */
    ) {
      nextState = removeEntity(
        nextState,
        action.meta.entityName,
        action.meta.itemId
      );
    }
    return nextState;
  }

  // 2. Handle specific single item fetch success (if response isn't already normalized)
  //    This is less common if using normalizr consistently, but provides a fallback.
  // switch (action.type) {
  //    case FETCH_SINGLE_ARTICLE_SUCCESS:
  //       // If the response for a single item isn't normalized into `action.response.entities`
  //       // you would handle it here. Example: response is the article object itself.
  //       const articleData = action.response; // Adjust based on actual API response structure
  //       if (articleData && articleData.id) { // Assuming article has an 'id'
  //          return {
  //              ...state,
  //              articles: {
  //                  ...state.articles,
  //                  [articleData.id]: { ...(state.articles[articleData.id] || {}), ...articleData }
  //              }
  //          };
  //       }
  //       return state;
  //    default:
  //       return state;
  // }

  // 3. Handle explicit removal based on action metadata (e.g., after a successful DELETE API call)
  //    This logic might be redundant if handled after merging above, but can be explicit.

  // if (
  //   action.meta?.entityName &&
  //   action.meta?.itemId /* && action relates to a DELETE success */
  // ) {
  //   // This check might be better placed within the `if (action.response?.entities)` block
  //   // if the DELETE response includes the ID or relevant data.
  //   // If DELETE response is empty, this separate check is needed.
  //   if (state[action.meta.entityName]) {
  //     // Check if entity type exists
  //     return removeEntity(state, action.meta.entityName, action.meta.itemId);
  //   }
  // }

  return state;
}

