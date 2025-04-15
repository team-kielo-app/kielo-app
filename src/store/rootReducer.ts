import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@features/auth/authReducer";
import articlesReducer from "@features/articles/articlesReducer";

const rootReducer = combineReducers({
  auth: authReducer,
  articles: articlesReducer,
});

export default rootReducer;

