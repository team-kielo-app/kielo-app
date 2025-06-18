import type { ApiStatusType } from '@lib/api.d'

export interface ExampleSentencePair {
  sentence_fi: string
  translation_en?: string
}

export interface ReviewItemExerciseSnippet {
  exercise_type: 'mcq' | 'fill_blank' | string
  prompt: string
  options?: string[]
  correct_answer: string
}

export interface ReviewItem {
  item_id: string
  item_type: 'word' | 'grammar' | string
  display_text: string
  review_reason?: string | null

  primary_translation_en?: string | null
  part_of_speech?: string | null
  pronunciation_ipa?: string | null
  cefr_level?: string | null
  word_user_status?: string | null
  secondary_translations_en?: any
  related_lemmas?: any
  word_notes?: string | null
  word_examples?: ExampleSentencePair[] | null

  grammar_name_fi?: string | null
  grammar_category?: string | null
  grammar_explanation_en?: string | null
  grammar_user_status?: string | null
  example_structures?: any
  common_mistakes_en?: string | null
  related_concepts?: any
  grammar_notes?: string | null
  grammar_examples?: ExampleSentencePair[] | null

  exercise_snippet?: ReviewItemExerciseSnippet | null
}

export interface ReviewsState {
  items: ReviewItem[]
  status: ApiStatusType
  error: string | null
  nextBatchAvailableAt: string | null
  currentItemIndex: number
}

export interface ReviewOutcomePayload {
  interaction_success: boolean
  review_timestamp_client: string
  response_time_ms?: number
  review_interaction_type: string
  difficulty_assessment?: 'easy' | 'medium' | 'hard'
}

export interface FetchReviewsApiResponse {
  user_id: string
  items_to_review: ReviewItem[]
  next_batch_available_at: string | null
}
