// src/features/savedItems/types.ts
import { Status } from '@types'
import { Article } from '@features/articles/types' // Import other item types if needed (BaseWord, etc.)

// Type for the 'item_details' which varies
// Using Article for now, expand with BaseWordSnippet etc. as needed
type SavedItemDetails =
  | Article
  | { id: string; word_fi?: string /* other word details*/ }
  | null

// Structure of a single saved item from the API list endpoint
export interface SavedItem {
  item_type: 'ArticleVersion' | 'BaseWord' | string // Be specific or allow string
  item_id: string
  saved_at: string // ISO Date string
  notes?: string | null
  item_details?: SavedItemDetails // Populated by the list endpoint
}

// Structure for POST request
export interface SaveItemPayload {
  item_type: string
  item_id: string
  notes?: string
}

// Structure for DELETE request (used in thunk arg)
export interface UnsaveItemPayload {
  item_type: string
  item_id: string
}

// Redux state for this slice
export interface SavedItemsState {
  items: SavedItem[]
  status: Status // Status for LISTING items
  error: string | null
  // Status tracking for individual save/unsave operations (optional, can be local state)
  // operationStatus: { [itemId: string]: Status };
  // operationError: { [itemId: string]: string | null };
}
