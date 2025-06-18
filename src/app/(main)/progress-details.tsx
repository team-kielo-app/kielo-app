// src/app/(main)/progress-details.tsx
import React, { useEffect, useCallback } from 'react' // Added useEffect, useCallback
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl // For pull-to-refresh
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context' // For padding
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { useSelector, useDispatch } from 'react-redux' // For fetching real data
import { AppDispatch, RootState } from '@/store/store'
import {
  selectProgressSummary,
  selectProgressStatus
} from '@features/progress/progressSlice'
import { ProgressSummary } from '@features/progress/types' // Import type
import { useRefresh } from '@hooks/useRefresh'
import { BarChart3, Clock4 } from 'lucide-react-native' // Example icons
import { fetchProgressThunk } from '@/features/progress/progressActions'

// Placeholder until you have a chart library.
// This function now takes actual weekly activity data.
function WeeklyActivityChartPlaceholder({
  weeklyActivity
}: {
  weeklyActivity: ProgressSummary['weekly_activity']
}): React.ReactElement {
  const maxMinutes = Math.max(...weeklyActivity.map(item => item.minutes), 0, 1) // Ensure maxMinutes is at least 1 to avoid division by zero

  return (
    <View style={styles.manualChartContainer}>
      {weeklyActivity.map(item => (
        <View key={item.day} style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              {
                height: (item.minutes / maxMinutes) * 100,
                backgroundColor: Colors.light.secondaryLight
              }
            ]}
          />
          <Text style={styles.barLabel}>{item.day}</Text>
        </View>
      ))}
    </View>
  )
}

export default function ProgressDetailsScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const dispatch = useDispatch<AppDispatch>()
  const insets = useSafeAreaInsets()

  const progressData = useSelector(selectProgressSummary)
  const progressStatus = useSelector(selectProgressStatus)

  const fetchData = useCallback(() => {
    if (
      isAuthenticated &&
      (progressStatus === 'idle' || progressStatus === 'failed')
    ) {
      dispatch(fetchProgressThunk())
    }
  }, [dispatch, isAuthenticated, progressStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const [isPullRefreshing, handlePullRefresh] = useRefresh(async () => {
    if (isAuthenticated) {
      await dispatch(fetchProgressThunk())
    }
  })

  if (isAuthLoading || !isAuthenticated) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }

  if (progressStatus === 'loading' && !progressData) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.infoText}>Loading progress...</Text>
        </View>
      </View>
    )
  }

  if (progressStatus === 'failed' && !progressData) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>Could not load your progress.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!progressData) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.infoText}>
            No progress data available yet. Start learning!
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {/* Overview Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Level:</Text>
            <Text style={styles.statValue}>
              {progressData.level} (
              {Math.round(progressData.progress_to_next_level * 100)}% to Lvl{' '}
              {progressData.level + 1})
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Study Time:</Text>
            <Text style={styles.statValue}>
              {Math.round(progressData.total_study_time_minutes / 60)} hours (
              {progressData.total_study_time_minutes} min)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Words Learned:</Text>
            <Text style={styles.statValue}>
              {progressData.learned_words_count}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Articles Read:</Text>
            <Text style={styles.statValue}>
              {progressData.articles_read_count}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Exercises Completed:</Text>
            <Text style={styles.statValue}>
              {progressData.exercises_completed_count}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Longest Streak:</Text>
            <Text style={styles.statValue}>
              {progressData.streak.longest_streak_days} days
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Current Streak:</Text>
            <Text style={styles.statValue}>
              {progressData.streak.current_streak_days} days
            </Text>
          </View>
        </View>

        {/* Weekly Activity Section */}
        {progressData.weekly_activity &&
          progressData.weekly_activity.length > 0 && (
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Weekly Activity</Text>
                <BarChart3 size={20} color={Colors.light.primary} />
              </View>
              <WeeklyActivityChartPlaceholder
                weeklyActivity={progressData.weekly_activity}
              />
            </View>
          )}

        {/* Category Progress Section */}
        {progressData.category_progress &&
          progressData.category_progress.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Category Focus</Text>
              {progressData.category_progress.map(cat => (
                <View key={cat.category} style={styles.categoryItem}>
                  <Text style={styles.categoryName}>{cat.category}</Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            (cat.time_spent_minutes /
                              (progressData.total_study_time_minutes || 1)) *
                              100
                          )}%`,
                          backgroundColor: Colors.light.primary // Use a consistent color or map category to color
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.categoryPercentage}>
                    {cat.time_spent_minutes} min
                  </Text>
                </View>
              ))}
              <View style={styles.totalTimeContainer}>
                <Clock4 size={16} color={Colors.light.textSecondary} />
                <Text style={styles.totalTimeText}>
                  Total Study Time: {progressData.total_study_time_minutes}{' '}
                  minutes
                </Text>
              </View>
            </View>
          )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary
  },
  fullScreenLoader: { flex: 1, backgroundColor: Colors.light.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    padding: 16 // Consistent padding
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20, // Spacing between cards
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  sectionHeaderRow: {
    // For section title + icon
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 12 // If no icon in row
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6, // Spacing for each stat
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderSubtle
  },
  statRowLast: {
    // To remove border from last stat
    borderBottomWidth: 0
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  statValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.text
  },
  // Chart Placeholder Styles
  manualChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 130, // Adjusted height
    marginTop: 10,
    paddingHorizontal: 5
  },
  barContainer: { alignItems: 'center', flex: 1 }, // flex:1 for equal spacing
  bar: {
    width: 12, // Thinner bars
    // backgroundColor: Colors.light.secondaryLight, // Use secondary light for bars
    borderRadius: 4,
    maxHeight: 100 // Relative to container height
  },
  barLabel: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    marginTop: 6,
    fontFamily: 'Inter-Regular'
  },
  // Category Progress Styles
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderSubtle
  },
  categoryItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0
  },
  categoryName: {
    flexBasis: 100, // Give fixed basis for names
    flexShrink: 0,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.text,
    marginRight: 8
  },
  progressBarBackground: {
    flexGrow: 1, // Take remaining space
    height: 10, // Slightly thicker progress bar
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8
  },
  progressBarFill: { height: '100%', borderRadius: 5 },
  categoryPercentage: {
    // Now shows time
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    textAlign: 'right',
    minWidth: 60 // Ensure space for "XX min"
  },
  totalTimeContainer: {
    // Copied from ProfileScreen for consistency
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderSubtle,
    justifyContent: 'center'
  },
  totalTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginLeft: 6
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  infoText: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  },
  errorText: {
    textAlign: 'center',
    fontSize: 15,
    color: Colors.light.error,
    fontFamily: 'Inter-Medium',
    marginBottom: 10
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  retryButtonText: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14
  }
})
