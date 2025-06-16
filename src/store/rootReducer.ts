import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@features/auth/authReducer'
import articlePaginationReducer from '@features/articles/articlesReducer'
import entitiesReducer from '@entities/reducer'
import mediaReducer from '@features/media/mediaSlice'
import savedItemsReducer from '@features/savedItems/savedItemsSlice'
import vocabularyReducer from '@features/vocabulary/vocabularySlice'
import readsReducer from '@features/reads/readsSlice'
import progressReducer from '@features/progress/progressSlice'
import achievementsReducer from '@features/achievements/achievementsSlice'
import reviewsReducer from '@features/reviews/reviewsSlice'
import lessonsReducer from '@features/lessons/lessonsSlice'
import challengesReducer from '@features/challenges/challengesSlice'

const pagination = combineReducers({
  articlePagination: articlePaginationReducer
})

const rootReducer = combineReducers({
  auth: authReducer,
  entities: entitiesReducer,
  media: mediaReducer,
  savedItems: savedItemsReducer,
  vocabulary: vocabularyReducer,
  reads: readsReducer,
  progress: progressReducer,
  achievements: achievementsReducer,
  reviews: reviewsReducer,
  lessons: lessonsReducer,
  challenges: challengesReducer,
  pagination
})

export default rootReducer
