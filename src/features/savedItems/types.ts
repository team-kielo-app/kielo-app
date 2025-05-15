import { ApiStatusType } from '@lib/api.d'
import { Article } from '@features/articles/types'

// Define snippet types if they are different from full entity types
export interface BaseWordSnippet {
  id: string // This would be the base_word_id
  word_fi: string
  basic_definition_en?: string
  part_of_speech?: string
}

// type SavedItemDetails =
//   | Article // Full article details
//   | BaseWordSnippet // Snippet for base words
//   | null // If details might be missing

// Base interface for common SavedItem properties
interface SavedItemBase {
  item_id: string
  saved_at: string // ISO Date string
  notes?: string | null
}

// Structure of a single saved item from the API list endpoint
export interface SavedArticleItem extends SavedItemBase {
  item_type: 'ArticleVersion'
  item_details?: Article | null // Assuming full article for now
}

export interface SavedBaseWordItem extends SavedItemBase {
  item_type: 'BaseWord'
  item_details?: BaseWordSnippet | null
}

// Add other item types like SavedGrammarConceptItem if needed
// export interface SavedGrammarConceptItem extends SavedItemBase {
//   item_type: 'GrammarConcept';
//   item_details?: GrammarConceptSnippet | null;
// }

export type SavedItem = SavedArticleItem | SavedBaseWordItem // | SavedGrammarConceptItem;

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
  status: ApiStatusType // Status for LISTING items
  error: string | null
  // Status tracking for individual save/unsave operations (optional, can be local state)
  // operationStatus: { [itemId: string]: Status };
  // operationError: { [itemId: string]: string | null };
}

export interface BaseWordSnippet {
  id: string // This would be the base_word_id
  word_fi: string
  basic_definition_en?: string // Example field
  part_of_speech?: string // Example field
}
