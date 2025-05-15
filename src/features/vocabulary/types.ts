import { ApiStatusType } from '@lib/api.d'

// Assuming a structure for BaseWord included in the response
interface BaseWordSnippet {
  id: string
  word_fi: string
  // Add other relevant snippet details like part_of_speech, basic_definition_en
}

// Structure for a single vocabulary entry from the API list
export type VocabularyStatus = 'New' | 'Learning' | 'Known' | 'Ignored'

export interface UserVocabularyEntry {
  base_word_id: string
  status: VocabularyStatus
  last_reviewed_at?: string | null // ISO Date string
  created_at: string
  updated_at: string
  base_word?: BaseWordSnippet | null // Populated by the list endpoint
}

// Structure for the vocabulary list API response
export interface VocabularyListResponse {
  vocabulary: UserVocabularyEntry[]
  // Add pagination details if your API supports it
}

// Structure for PUT request payload
export interface UpdateVocabularyPayload {
  base_word_id: string
  status: VocabularyStatus
}

// Redux state for this slice
export interface VocabularyState {
  entries: UserVocabularyEntry[] // The list of vocabulary entries
  status: ApiStatusType
  error: string | null
  // Optional: Track status for individual word updates
  updateStatus: { [baseWordId: string]: Status }
  updateError: { [baseWordId: string]: string | null }
}
