import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { Link } from 'expo-router'
import {
  ChevronRight,
  Trophy,
  Star,
  BookText,
  Brain
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { DailyGoalChart } from './DailyGoalChart' // Assuming it's in the same folder
import { ProgressCard } from './ProgressCard' // Assuming it's in the same folder
import { ProgressSummary } from '@features/progress/types' // Your ProgressSummary type
import { ApiStatusType } from '@lib/api.d'

interface UserProgressSummaryProps {
  progressSummary: ProgressSummary | null
  progressStatus: ApiStatusType
  isDesktop?: boolean
}

export const UserProgressSummary: React.FC<UserProgressSummaryProps> = ({
  progressSummary,
  progressStatus,
  isDesktop = false
}) => {
  const showProgressLoading = progressStatus === 'loading' && !progressSummary

  if (showProgressLoading) {
    return (
      <View style={styles.centeredSection}>
        <ActivityIndicator color={Colors.light.primary} />
      </View>
    )
  }

  if (progressStatus === 'failed' && !progressSummary) {
    return (
      <View style={styles.centeredSection}>
        <Text style={styles.errorText}>Could not load progress.</Text>
      </View>
    )
  }

  if (!progressSummary || progressStatus !== 'succeeded') {
    return null // Don't render if no summary or not succeeded (unless loading/error handled above)
  }

  return (
    <>
      <View style={[styles.streakContainer, { marginBottom: 24 }]}>
        <View style={styles.streakInfo}>
          <Trophy size={20} color={Colors.light.accent} />
          <Text style={styles.streakText}>
            {progressSummary.streak.current_streak_days} day streak! Keep it up!
          </Text>
        </View>
        {/* Ensure weekly_activity is not empty or undefined */}
        {progressSummary.weekly_activity &&
          progressSummary.weekly_activity.length > 0 && (
            <DailyGoalChart data={progressSummary.weekly_activity} />
          )}
      </View>

      <View style={[styles.section, isDesktop && styles.wideScreenSection]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Link href="/(main)/progress-details" asChild>
            <TouchableOpacity
              style={styles.seeAllButton}
              accessibilityRole="link"
              accessibilityLabel="See all progress details"
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </Link>
        </View>
        <View style={styles.progressCardsContainer}>
          <ProgressCard
            icon={<Star size={20} color={Colors.light.primary} />}
            title="Known Words"
            subtitle={`${progressSummary.learned_words_count} words mastered`}
            progress={0.45} // Placeholder - TODO: Calculate actual progress
            color={Colors.light.primary}
          />
          <ProgressCard
            icon={<Brain size={20} color={Colors.light.success} />}
            title="Learning Words"
            subtitle={`${progressSummary.learning_words_count} words in progress`}
            progress={0.6} // Placeholder - TODO: Calculate actual progress
            color={Colors.light.success}
          />
          <ProgressCard
            icon={<BookText size={20} color={Colors.light.accent} />}
            title="Reading"
            subtitle={`${progressSummary.articles_read_count} articles completed`}
            progress={0.7} // Placeholder - TODO: Calculate actual progress
            color={Colors.light.accent}
          />
        </View>
      </View>
    </>
  )
}

// Styles copied and adapted from HomeScreen
const styles = StyleSheet.create({
  centeredSection: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center'
  },
  streakContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  streakText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 8
  },
  section: {
    marginBottom: 28
  },
  wideScreenSection: {
    // flexDirection: 'column', // Default for View
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 2
  },
  progressCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12
  }
})
