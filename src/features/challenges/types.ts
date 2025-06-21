import type { ApiStatusType } from '@lib/api.d'
import type { ReviewItem } from '@features/reviews/types'
import type { LessonData, LessonExercise } from '@features/lessons/types'

export interface ChallengeSectionBase {
  type: string
  title: string
  is_completed?: boolean
}

export interface ChallengeNSRSection extends ChallengeSectionBase {
  type: 'spaced_repetition_review'
  items: Array<{
    item_id: string
    item_type: 'word' | 'grammar' | string
    display_text: string
  }>
}

export interface ChallengeLessonSection extends ChallengeSectionBase {
  type: 'targeted_weakness_practice' | 'lesson_practice'
  lesson_details: LessonData
}

export interface ChallengeContextualPracticeSection
  extends ChallengeSectionBase {
  type: 'contextual_practice'
  exercises: LessonExercise[]
}

export type ChallengeSection =
  | ChallengeNSRSection
  | ChallengeLessonSection
  | ChallengeContextualPracticeSection

export interface DailyChallengeApiResponse {
  user_id: string
  challenge_date: string
  challenge_id: string
  title: string
  sections_json: ChallengeSection[]
  status:
    | 'generated'
    | 'started'
    | 'in_progress'
    | 'completed'
    | 'skipped'
    | string
  message?: string
  estimated_total_time_minutes?: number
  total_reward_points?: number
}

export interface DailyChallenge
  extends Omit<DailyChallengeApiResponse, 'sections_json'> {
  sections: ChallengeSection[]
}

export interface ChallengesState {
  currentDailyChallenge: DailyChallenge | null
  status: ApiStatusType
  error: string | null
  updateStatus: ApiStatusType
  updateError: string | null
}
