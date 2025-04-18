import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@features/auth/authReducer";
import articlePaginationReducer from "@features/articles/articlesReducer";
import entitiesReducer from "@entities/reducer";

const pagination = combineReducers({
  articlePagination: articlePaginationReducer,
});

const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
  pagination,
});

export default rootReducer;

