// src/features/achievements/types.ts
import { ApiStatusType } from '@lib/api.d'

// Assuming a structure for the detailed achievement info
export interface AchievementDetails {
  achievement_id: string
  name: string
  description: string
  icon_name?: string | null // Name for an icon component
  points?: number
  // Add other detail fields like criteria, category etc.
}

// Structure for an earned achievement entry from the API list
export interface EarnedAchievement {
  achievement_id: string
  earned_at: string // ISO Date string
  details?: AchievementDetails | null // Populated by the list endpoint
}

// Structure for the earned achievements list API response
export interface AchievementListResponse {
  achievements: EarnedAchievement[]
  // Add pagination details if applicable
}

// Redux state for this slice
export interface AchievementsState {
  earnedAchievements: EarnedAchievement[] // List of earned achievements
  status: ApiStatusType // Status for LISTING earned achievements
  error: string | null
}
