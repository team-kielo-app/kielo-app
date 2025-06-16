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
  review_items_preview: ReviewItem[]
  target_review_count?: number
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

export interface DailyChallenge {
  user_id: string
  challenge_date: string
  challenge_id: string
  title: string
  sections: ChallengeSection[]
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

export interface ChallengesState {
  currentDailyChallenge: DailyChallenge | null
  status: ApiStatusType
  error: string | null
  updateStatus: ApiStatusType
  updateError: string | null
}
