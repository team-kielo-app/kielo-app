import type { ApiStatusType } from '@lib/api.d'

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
  review_reason?: string

  primary_translation_en?: string
  part_of_speech?: string
  example_sentence_fi?: string
  pronunciation_ipa?: string
  cefr_level?: string
  word_user_status?: string

  grammar_name_fi?: string
  grammar_category?: string
  grammar_rule_summary_en?: string

  exercise_snippet?: ReviewItemExerciseSnippet
}

export interface ReviewsState {
  items: ReviewItem[]
  status: ApiStatusType
  error: string | null
  nextBatchAvailableAt: string | null
  currentItemIndex: number
}

export interface ReviewOutcomePayload {
  kielo_internal_status_suggestion?: string
  interaction_success: boolean
  review_timestamp_client: string
  response_time_ms?: number
  review_interaction_type: string
}

export interface FetchReviewsApiResponse {
  user_id: string
  items_to_review: ReviewItem[]
  next_batch_available_at: string | null
}
