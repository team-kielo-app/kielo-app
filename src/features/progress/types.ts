// src/features/progress/types.ts
import { Status } from '@types'

export interface StreakInfo {
  current_streak_days: number
  longest_streak_days: number
  last_activity_date?: string | null // ISO Date string
}

// Matches the API response structure for GET /me/progress
export interface ProgressSummary {
  streak: StreakInfo
  learned_words_count: number
  articles_read_count: number
  achievements_earned_count: number
}

// Redux state for this slice
export interface ProgressState {
  summary: ProgressSummary | null
  status: Status
  error: string | null
}
