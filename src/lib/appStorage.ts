import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Stores a non-sensitive item persistently. Uses AsyncStorage on native, localStorage on web.
 * @param key The key for the item.
 * @param value The string value to store.
 */
export const setAppItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
    } else {
      await AsyncStorage.setItem(key, value)
    }
  } catch (error) {
    console.error(`Error setting app item for key "${key}":`, error)
  }
}

/**
 * Retrieves a non-sensitive persistent item.
 * @param key The key of the item to retrieve.
 * @returns The stored string value, or null if not found or on error.
 */
export const getAppItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    } else {
      return await AsyncStorage.getItem(key)
    }
  } catch (error) {
    console.error(`Error getting app item for key "${key}":`, error)
    return null
  }
}

/**
 * Deletes a non-sensitive persistent item.
 * @param key The key of the item to delete.
 */
export const deleteAppItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
    } else {
      await AsyncStorage.removeItem(key)
    }
  } catch (error) {
    console.error(`Error deleting app item for key "${key}":`, error)
  }
}
