import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@features/auth/authReducer'
import articlePaginationReducer from '@features/articles/articlesReducer'
import entitiesReducer from '@entities/reducer'
import mediaReducer from '@features/media/mediaSlice'

const pagination = combineReducers({
  articlePagination: articlePaginationReducer
})

const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
  media: mediaReducer,
  pagination
})

export default rootReducer
