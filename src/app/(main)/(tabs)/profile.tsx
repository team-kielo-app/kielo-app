import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useWindowDimensions // Import dimension hook
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Settings,
  BookOpen,
  CheckCircle,
  BarChart,
  Award,
  Calendar
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleCardWithThumbnail } from '@/components/reader/ArticleCardWithThumbnail'
import { ProgressRing } from '@/components/profile/ProgressRing'
import { fetchProgressThunk } from '@features/progress/progressActions'
import {
  selectProgressSummary,
  selectProgressStatus
} from '@features/progress/progressSlice'
import { fetchEarnedAchievementsThunk } from '@features/achievements/achievementsActions'
import {
  selectEarnedAchievements,
  selectAchievementsStatus
} from '@features/achievements/achievementsSlice'
import { AchievementCard } from '@/components/profile/AchievementCard'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { useSelector, useDispatch } from 'react-redux'
import { fetchArticles } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectUser, selectAuthStatus } from '@features/auth/authSelectors'
import { selectPaginatedData } from '@pagination/selectors'
import { useRouter, Link } from 'expo-router'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { nameParser } from '@/utils/string'

// Filled from original file
const stats = [
  {
    id: 'words',
    label: 'Words Learned',
    value: 145,
    icon: <CheckCircle size={18} color={Colors.light.primary} />
  },
  {
    id: 'articles',
    label: 'Articles Read',
    value: 12,
    icon: <BookOpen size={18} color={Colors.light.accent} />
  },
  {
    id: 'streak',
    label: 'Day Streak',
    value: 7,
    icon: <Calendar size={18} color={Colors.light.warning} />
  }
]

// Filled from original file
const achievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first article',
    progress: 1,
    total: 1,
    color: Colors.light.success,
    earned: true
  },
  {
    id: '2',
    title: 'Word Collector',
    description: 'Learn 100 Finnish words',
    progress: 145,
    total: 100,
    color: Colors.light.primary,
    earned: true
  },
  {
    id: '3',
    title: 'Dedicated Reader',
    description: 'Read articles for 5 days in a row',
    progress: 7,
    total: 5,
    color: Colors.light.accent,
    earned: true
  },
  {
    id: '4',
    title: 'Vocabulary Master',
    description: 'Learn 500 Finnish words',
    progress: 145,
    total: 500,
    color: Colors.light.warning,
    earned: false
  }
]

export default function ProfileScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute() // Auth check
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  // Selectors
  const userState = useSelector((state: RootState) => selectUser(state))
  // Saved Articles (keep this logic)
  const { data: savedArticles, pagination: savedArticlesPagination } =
    useSelector((state: RootState) =>
      selectPaginatedData(
        'articles',
        'articlePagination',
        `${userState?.id}-saved`,
        true
      )(state)
    )
  // Progress Summary
  const progressSummary = useSelector(selectProgressSummary)
  const progressStatus = useSelector(selectProgressStatus)
  // Earned Achievements
  const earnedAchievements = useSelector(selectEarnedAchievements)
  const achievementsStatus = useSelector(selectAchievementsStatus)

  // Fetch Data Effect
  useEffect(() => {
    if (isAuthenticated && userState?.id) {
      // Fetch Saved Articles (if needed)
      if (!savedArticlesPagination.isLoading) {
        dispatch(
          fetchArticles(`${userState.id}-saved`, {
            reset: true
          })
        )
      }
      // Fetch Progress Summary (if needed)
      if (progressStatus === 'idle') {
        dispatch(fetchProgressThunk())
      }
      // Fetch Achievements (if needed)
      if (achievementsStatus === 'idle') {
        dispatch(fetchEarnedAchievementsThunk())
      }
    }
  }, [dispatch, isAuthenticated, userState?.id]) // Dependencies

  // Authentication loading/guard
  if (isAuthLoading || !isAuthenticated || !userState) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {' '}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>{' '}
      </SafeAreaView>
    )
  }

  // Prepare stats data from progress summary
  const userStats = progressSummary
    ? [
        {
          id: 'words',
          label: 'Words Learned',
          value: progressSummary.learned_words_count,
          icon: <CheckCircle size={18} color={Colors.light.primary} />
        },
        {
          id: 'articles',
          label: 'Articles Read',
          value: progressSummary.articles_read_count,
          icon: <BookOpen size={18} color={Colors.light.accent} />
        },
        {
          id: 'streak',
          label: 'Day Streak',
          value: progressSummary.streak.current_streak_days,
          icon: <Calendar size={18} color={Colors.light.warning} />
        }
      ]
    : [] // Empty array if summary not loaded

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/(main)/settings/')}
        >
          <Settings size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent
        ]}
        // showsVerticalScrollIndicator={false}
      >
        {/* Profile info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: `https://picsum.photos/seed/${userState?.id}/160/160`
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {nameParser(userState?.displayName || 'Duy Khanh Le', {
                maxLen: 32
              })}
            </Text>
            <Text style={styles.profileSubtitle}>
              Learning Finnish • Beginner
            </Text>
            <View style={styles.learningStatus}>
              <View style={styles.progressContainer}>
                <ProgressRing
                  progress={0.32}
                  size={60}
                  strokeWidth={6}
                  color={Colors.light.primary}
                />
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressPercentage}>32%</Text>
                  <Text style={styles.progressLabel}>Level 1</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.streakContainer}>
                <Award size={24} color={Colors.light.accent} />
                {progressStatus === 'loading' && !progressSummary ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.streakValue}>
                    {progressSummary?.streak?.current_streak_days ?? 0}
                  </Text>
                )}
                <Text style={styles.streakLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          {progressStatus === 'loading' && !progressSummary ? (
            <ActivityIndicator />
          ) : (
            userStats.map(stat => (
              <View key={stat.id} style={styles.statItem}>
                <View style={styles.statIconContainer}>{stat.icon}</View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))
          )}
          {progressStatus === 'failed' && (
            <Text style={styles.errorTextSmall}>Failed to load stats</Text>
          )}
        </View>

        {/* Saved Articles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved Articles</Text>
            <Link href="/(main)/saved-articles" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {savedArticlesPagination.isLoading && savedArticles.length === 0 && (
            <ActivityIndicator />
          )}
          {!savedArticlesPagination.isLoading && savedArticles.length === 0 && (
            <Text style={styles.emptySectionText}>No saved articles yet.</Text>
          )}
          {savedArticles.length > 0 &&
            (isDesktop ? (
              <View style={styles.wideScreenArticles}>
                {savedArticles.map(article => (
                  <ArticleCardWithThumbnail
                    key={article.id}
                    article={article}
                    size="medium"
                  />
                ))}
              </View>
            ) : (
              <ScrollView
                horizontal
                // showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.savedArticlesScrollContent}
              >
                {savedArticles.map(article => (
                  <ArticleCardWithThumbnail
                    key={article.id}
                    article={article}
                  />
                ))}
              </ScrollView>
            ))}
        </View>

        {/* Vocabulary Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Vocabulary</Text>
            <Link href="/(main)/vocabulary" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.vocabularyCard}>
            <View style={styles.vocabularyHeader}>
              <View style={styles.vocabularyInfo}>
                <Text style={styles.vocabularyTitle}>Collected Words</Text>
                <Text style={styles.vocabularyCount}>145 words</Text>
              </View>
              <BarChart size={24} color={Colors.light.primary} />
            </View>
            <TouchableOpacity
              style={styles.practiceButton}
              onPress={() => router.push('/(main)/(tabs)/exercises')}
            >
              <Text style={styles.practiceButtonText}>Practice Vocabulary</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Achievements */}
        {/* Display fetched achievements or loading/empty/error states */}
        {achievementsStatus === 'loading' &&
          earnedAchievements.length === 0 && <ActivityIndicator />}
        {achievementsStatus === 'failed' && (
          <Text style={styles.errorTextSmall}>Failed to load achievements</Text>
        )}
        {achievementsStatus !== 'loading' &&
          earnedAchievements.length === 0 && (
            <Text style={styles.emptySectionText}>
              No achievements earned yet.
            </Text>
          )}
        {earnedAchievements.length > 0 && (
          <View
            style={[
              styles.achievementsContainer,
              isDesktop && styles.wideScreenAchievements
            ]}
          >
            {/* Map over fetched earnedAchievements */}
            {earnedAchievements.map(achievement => (
              // Ensure AchievementCard expects the EarnedAchievement structure
              <AchievementCard
                key={achievement.achievement_id}
                achievement={achievement}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Styles filled from original file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTextSmall: {
    // Smaller error text for inline use
    fontSize: 12,
    color: Colors.light.error,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center' // Align items vertically
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.light.text,
    marginBottom: 4
  },
  profileSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12
  },
  learningStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8 // Add some margin
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  progressTextContainer: {
    marginLeft: 12
  },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: Colors.light.primary
  },
  progressLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16
  },
  streakContainer: {
    alignItems: 'center'
  },
  streakValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 4
  },
  streakLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-around' // Distribute items evenly
  },
  statItem: {
    flex: 1, // Allow items to take equal space
    alignItems: 'center',
    maxWidth: 100 // Prevent items from getting too wide
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.light.text
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 2 // Add margin top for label
  },
  section: {
    marginBottom: 24
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary // Use primary color for links
  },
  savedArticlesScrollContent: {
    paddingRight: 20, // Ensure last item is visible
    gap: 12 // Add gap between items
  },
  wideScreenArticles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16 // Use gap for spacing
  },
  vocabularyCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  vocabularyInfo: {},
  vocabularyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  vocabularyCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  practiceButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  practiceButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.white
  },
  achievementsContainer: {
    flexDirection: 'column', // Default for mobile
    gap: 12 // Use gap
  },
  wideScreenAchievements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16 // Use gap
  },
  emptySectionText: {
    color: Colors.light.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Inter-Regular'
  }
})
