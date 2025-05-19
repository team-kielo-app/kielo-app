// src/store/persistStorage.ts
import { Storage } from 'redux-persist'
import { setAppItem, getAppItem, deleteAppItem } from '@lib/appStorage' // Your existing functions

const persistStorage: Storage = {
  setItem: (key, value) => {
    return setAppItem(key, value) // Already returns Promise<void>
  },
  getItem: key => {
    return getAppItem(key) // Already returns Promise<string | null>
  },
  removeItem: key => {
    return deleteAppItem(key) // Already returns Promise<void>
  }
}

export default persistStorage
