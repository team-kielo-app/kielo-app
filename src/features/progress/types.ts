import type { ApiStatusType } from '@lib/api.d'

export interface StreakInfo {
  current_streak_days: number
  longest_streak_days: number
  last_activity_date?: string | null
}

export interface WeeklyActivityDay {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  minutes: number
}

export interface CategoryProgress {
  category: string
  time_spent_minutes: number
}

export interface ProgressSummary {
  streak: StreakInfo
  level: number
  progress_to_next_level: number
  total_study_time_minutes: number
  learned_words_count: number
  learning_words_count: number
  articles_read_count: number
  exercises_completed_count: number
  achievements_earned_count: number
  weekly_activity: WeeklyActivityDay[]
  category_progress: CategoryProgress[]
}

export interface ProgressState {
  summary: ProgressSummary | null
  status: ApiStatusType
  error: string | null
}
