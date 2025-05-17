import type { ApiStatusType } from '@lib/api.d'
import type { MediaMetadata } from '@features/media/types'

export type ArticleType = {
  id: string
  title: string
  publication_date: string
  difficulty_score: ArticleDifficulty
  thumbnail?: MediaMetadata
  brand: ArticleBrand
  tags: string[]
  paragraphs: ArticleParagraph[]
}

export interface Article extends ArticleType {}

export type VocabularyType = {
  word: string
  translation: string
  example: string
}

export interface ArticlesState {
  items: ArticleType[]
  status: ApiStatusType
  error: string | null
  lastFetched: number | null
}

export interface ArticleDifficulty {
  Float64: number
  Valid: boolean
}

export interface ArticleBrand {
  source_identifier: string
  display_name: string
  navigation_bg_color_hex?: string
  navigation_text_color_hex?: string
  navigation_active_color_hex?: string
}

export interface ArticleParagraph {
  paragraph_id: string
  paragraph_index: number
  original_text_fi: string
  translation_en: string
  audio_url?: string | null
}

export interface BaseWordDetail {
  base_word_id: string
  word_fi: string
  part_of_speech: string
  primary_translation_en: string
  cefr_level?: string // Optional as not all words might have it
  pronunciation_ipa?: string
  secondary_translations_en?: string[]
  frequency_score?: number | null
  related_lemmas?: {
    antonyms?: string[]
    synonyms?: string[]
  }
}

export interface InflectedFormDetails {
  case?: string | null
  mood?: string | null
  tense?: string | null
  voice?: string | null
  number?: string | null
  person?: string | null
  clitics?: string[]
}

export interface WordOccurrence {
  occurrence_id: string
  base_word_id: string
  grammar_id?: string | null
  occurrence_type: 'word_contextual' | string // "word_contextual" or other types
  original_token_phrase: string
  start_char_offset: number
  end_char_offset: number
  sentence_text_fi: string
  inflected_form_details?: InflectedFormDetails | null
  specific_explanation_en?: string | null
  is_kpt_change_example?: boolean
  base_word_detail: BaseWordDetail
}

export interface GrammarDetail {
  grammar_id: string
  name_fi: string
  name_en: string
  explanation_en: string
  example_fi?: string
  example_translation_en?: string
  category: string
  cefr_level?: string
  example_structures?: string[]
  common_mistakes_en?: string
  related_concepts?: {
    contrasts_with?: string[]
    often_used_with?: string[]
  }
  notes?: string
}

export interface GrammarOccurrence {
  occurrence_id: string
  base_word_id?: string | null
  grammar_id: string
  occurrence_type: 'grammar_contextual' | string
  original_token_phrase: string
  start_char_offset: number
  end_char_offset: number
  sentence_text_fi: string
  sentence_translation_en: string
  specific_explanation_en?: string | null
  grammar_detail: GrammarDetail
}

export interface ArticleParagraph {
  paragraph_id: string
  paragraph_index: number
  original_text_fi: string
  translation_en: string
  audio_url?: string | null
  word_occurrences?: WordOccurrence[]
  grammar_occurrences?: GrammarOccurrence[]
}
