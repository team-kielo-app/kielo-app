import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist'
import rootReducer from './rootReducer'
import persistStorage from './persistStorage'
import AuthTransform from './authTransform'

const persistConfig = {
  key: 'root', // Key for the persisted state in storage
  storage: persistStorage, // Use your custom storage engine
  version: 1, // Optional: for migrations
  // Whitelist: specify which reducers you want to persist.
  // Useful for not persisting transient or large data.
  whitelist: [
    'auth',
    'entities' /* 'entities', 'pagination' (consider carefully) */
  ],
  // Blacklist: specify reducers you DO NOT want to persist.
  // blacklist: ['transientFeature'],
  transforms: [AuthTransform]
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer, // Use the persisted reducer
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>
