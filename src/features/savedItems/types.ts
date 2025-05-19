import { ApiStatusType } from '@lib/api.d'
import { Article } from '@features/articles/types'

export interface BaseWordSnippet {
  id: string
  word_fi: string
  basic_definition_en?: string
  part_of_speech?: string
}

export interface SavedItemReference {
  item_id: string
  item_type: 'ArticleVersion' | 'BaseWord' | string
  saved_at: string
  notes?: string | null
}
export interface ApiSavedItem {
  item_id: string
  item_type: 'ArticleVersion' | 'BaseWord' | string
  saved_at: string
  notes?: string | null
  item_details?: Article | BaseWordSnippet | null // This is what the API provides
}

export interface SaveItemPayload {
  item_type: string
  item_id: string
  notes?: string
}

export interface UnsaveItemPayload {
  item_type: string
  item_id: string
}

export interface SavedItemsState {
  items: SavedItemReference[]
  status: ApiStatusType
  error: string | null
}

export interface BaseWordSnippet {
  id: string
  word_fi: string
  basic_definition_en?: string
  part_of_speech?: string
}
