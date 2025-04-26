import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const isAvailable = SecureStore.isAvailableAsync()

/**
 * Securely stores an item. Uses SecureStore on native if available, localStorage on web.
 * @param key The key for the item.
 * @param value The string value to store.
 */
export const setSecureItem = async (
  key: string,
  value: string
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
    } else {
      if (await isAvailable) {
        await SecureStore.setItemAsync(key, value)
      } else {
        console.warn('SecureStore not available on this device.')
      }
    }
  } catch (error) {
    console.error(`Error setting secure item for key "${key}":`, error)
  }
}

/**
 * Retrieves a securely stored item.
 * @param key The key of the item to retrieve.
 * @returns The stored string value, or null if not found or on error.
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key)
    } else {
      if (await isAvailable) {
        return await SecureStore.getItemAsync(key)
      } else {
        console.warn('SecureStore not available on this device.')
        return null
      }
    }
  } catch (error) {
    console.error(`Error getting secure item for key "${key}":`, error)
    return null
  }
}

/**
 * Deletes a securely stored item.
 * @param key The key of the item to delete.
 */
export const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
    } else {
      if (await isAvailable) {
        await SecureStore.deleteItemAsync(key)
      } else {
        console.warn('SecureStore not available on this device.')
      }
    }
  } catch (error) {
    console.error(`Error deleting secure item for key "${key}":`, error)
  }
}
