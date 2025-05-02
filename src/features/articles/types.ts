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
