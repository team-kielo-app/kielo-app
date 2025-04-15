import * as actionTypes from "./articlesActionTypes";
import { ArticlesState, Article } from "./types";
import { ArticlesAction } from "./articlesActionTypes"; // Import union type
import { Status } from "@types"; // Import shared Status type

const initialState: ArticlesState = {
  items: [],
  status: "idle" as Status, // Cast initial status explicitly
  error: null,
  lastFetched: null,
};

// Helper function for upserting (used internally by reducer)
const upsertArticle = (
  state: ArticlesState,
  article: Article
): ArticlesState => {
  const index = state.items.findIndex((item) => item.id === article.id);
  let newItems = [...state.items];
  if (index !== -1) {
    newItems[index] = article; // Update
  } else {
    newItems.push(article); // Add
  }
  return { ...state, items: newItems };
};

const articlesReducer = (
  state = initialState,
  action: ArticlesAction
): ArticlesState => {
  switch (action.type) {
    case actionTypes.FETCH_ARTICLES_REQUEST:
    case actionTypes.FETCH_ARTICLE_BY_ID_REQUEST:
      return {
        ...state,
        status: "loading",
        // Optionally clear error on request start, or keep it until success
        // error: null,
      };

    case actionTypes.FETCH_ARTICLES_SUCCESS:
      return {
        ...state,
        status: "succeeded",
        items: action.payload, // Replace all items
        error: null,
        lastFetched: Date.now(),
      };

    case actionTypes.FETCH_ARTICLE_BY_ID_SUCCESS:
      // Use the upsert helper logic here
      const newState = upsertArticle(state, action.payload);
      return {
        ...newState, // Return the state updated by upsertArticle
        status: "succeeded", // Set status back to succeeded
        error: null,
        // Optionally update lastFetched here too? Or only for list fetch?
      };

    case actionTypes.FETCH_ARTICLES_FAILURE:
    case actionTypes.FETCH_ARTICLE_BY_ID_FAILURE:
      return {
        ...state,
        status: "failed",
        error: action.payload.message, // Use the message from the payload
      };

    case actionTypes.CLEAR_ARTICLES_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

export default articlesReducer;

