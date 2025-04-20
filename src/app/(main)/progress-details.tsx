import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
// Import chart library if needed, e.g., react-native-chart-kit or similar

// Filled Mock detailed progress data
const mockProgress = {
  overallLevel: 3,
  levelProgress: 0.65,
  totalMinutes: 1250,
  wordsLearned: 312,
  articlesRead: 45,
  exercisesCompleted: 88,
  longestStreak: 21,
  currentStreak: 7,
  weeklyActivity: [
    { day: 'Mon', minutes: 30 },
    { day: 'Tue', minutes: 45 },
    { day: 'Wed', minutes: 20 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 35 },
    { day: 'Sat', minutes: 50 },
    { day: 'Sun', minutes: 15 }
  ],
  categoryProgress: [
    { name: 'Vocabulary', progress: 0.75, color: Colors.light.primary },
    { name: 'Reading', progress: 0.6, color: Colors.light.accent },
    { name: 'Grammar', progress: 0.4, color: Colors.light.success },
    { name: 'Listening', progress: 0.55, color: Colors.light.warning }
  ]
}

export default function ProgressDetailsScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const progressData = mockProgress

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader title="Your Progress" fallbackPath="/(main)/(tabs)/" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.overviewCard}>
          <Text style={styles.statText}>
            Level: {progressData.overallLevel} (
            {Math.round(progressData.levelProgress * 100)}% to Level{' '}
            {progressData.overallLevel + 1})
          </Text>
          <Text style={styles.statText}>
            Total Study Time: {Math.round(progressData.totalMinutes / 60)} hours
          </Text>
          <Text style={styles.statText}>
            Words Learned: {progressData.wordsLearned}
          </Text>
          <Text style={styles.statText}>
            Articles Read: {progressData.articlesRead}
          </Text>
          <Text style={styles.statText}>
            Exercises Completed: {progressData.exercisesCompleted}
          </Text>
          <Text style={styles.statText}>
            Longest Streak: {progressData.longestStreak} days
          </Text>
          <Text style={styles.statText}>
            Current Streak: {progressData.currentStreak} days
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Weekly Activity (Minutes)</Text>
        <View style={styles.chartCard}>
          {/* Placeholder - Replace with actual chart */}
          <Text style={styles.placeholderText}>
            [Weekly Activity Bar Chart Here]
          </Text>
          {/* Example: Manually render bars */}
          <View style={styles.manualChartContainer}>
            {progressData.weeklyActivity.map(item => (
              <View key={item.day} style={styles.barContainer}>
                <View style={[styles.bar, { height: item.minutes * 2 }]} />
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Category Progress</Text>
        <View style={styles.categoryCard}>
          {progressData.categoryProgress.map(cat => (
            <View key={cat.name} style={styles.categoryItem}>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${cat.progress * 100}%`,
                      backgroundColor: cat.color
                    }
                  ]}
                />
              </View>
              <Text style={styles.categoryPercentage}>
                {Math.round(cat.progress * 100)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

// Styles based on previous implementation
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 12,
    marginTop: 16
  },
  overviewCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 6
  },
  chartCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  categoryCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  placeholderText: {
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    fontFamily: 'Inter-Regular'
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    '&:last-child': { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }
  },
  categoryName: {
    flex: 2,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.text
  },
  progressBarBackground: {
    flex: 3,
    height: 8,
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8
  },
  progressBarFill: { height: '100%', borderRadius: 4 },
  categoryPercentage: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    textAlign: 'right'
  },
  // Manual chart styles (Example)
  manualChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: 150,
    marginTop: 10
  },
  barContainer: { alignItems: 'center', marginHorizontal: 5 },
  bar: {
    width: 20,
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
    maxHeight: 140
  }, // Max height to prevent overflow
  barLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 4,
    fontFamily: 'Inter-Regular'
  }
})
