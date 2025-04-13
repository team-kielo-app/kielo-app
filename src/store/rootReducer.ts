import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articlesReducer from "../features/articles/articlesSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  articles: articlesReducer,
  // Add other reducers here as your app grows
});

export default rootReducer;
