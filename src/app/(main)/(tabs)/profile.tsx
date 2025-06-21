import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Settings,
  BookOpen,
  CheckCircle,
  BarChart,
  Award,
  Calendar,
  Zap,
  Clock
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
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
import { AppDispatch, RootState } from '@store/store'
import { selectUser } from '@features/auth/authSelectors'
import { useRouter, Link } from 'expo-router'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { nameParser } from '@/utils/string'
import { useFloatingTabBarHeight } from '@/hooks/useFloatingTabBarHeight'
import { useRefresh } from '@/hooks/useRefresh'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { fetchSavedItemsThunk } from '@features/savedItems/savedItemsActions'
import {
  selectHydratedSavedArticles,
  selectSavedItemsStatus
} from '@/features/savedItems/savedItemsSlice'

export default function ProfileScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const floatingTabBarHeight = useFloatingTabBarHeight()

  // --- Selectors for state ---
  const userState = useSelector((state: RootState) => selectUser(state))
  const progressSummary = useSelector(selectProgressSummary)
  const progressStatus = useSelector(selectProgressStatus)
  const earnedAchievements = useSelector(selectEarnedAchievements)
  const achievementsStatus = useSelector(selectAchievementsStatus)

  // Correct way to get saved articles
  const savedArticles = useSelector(selectHydratedSavedArticles)
  const savedItemsStatus = useSelector(selectSavedItemsStatus)
  const savedItemsError = useSelector(
    (state: RootState) => state.savedItems.error
  )

  // --- Unified Data Fetching Logic ---
  const fetchProfileData = useCallback(async () => {
    if (isAuthenticated) {
      const promises: Promise<any>[] = []
      // Fetch progress if needed
      if (progressStatus === 'idle' || progressStatus === 'failed') {
        promises.push(dispatch(fetchProgressThunk()))
      }
      // Fetch achievements if needed
      if (achievementsStatus === 'idle' || achievementsStatus === 'failed') {
        promises.push(dispatch(fetchEarnedAchievementsThunk()))
      }
      // Fetch saved items if needed
      if (savedItemsStatus === 'idle' || savedItemsStatus === 'failed') {
        promises.push(dispatch(fetchSavedItemsThunk()))
      }
      if (promises.length > 0) {
        await Promise.all(promises)
      }
    }
  }, [
    dispatch,
    isAuthenticated,
    progressStatus,
    achievementsStatus,
    savedItemsStatus
  ])

  useEffect(() => {
    fetchProfileData()
  }, [fetchProfileData])

  const [isRefreshing, handleRefresh] = useRefresh(fetchProfileData)

  // Mock pagination state for FeaturedArticles component from savedItems state
  const savedArticlesPagination = {
    isLoading: savedItemsStatus === 'loading' && savedArticles.length === 0,
    error: savedItemsError,
    hasMore: false, // Saved items list is not paginated
    hasFetched: savedItemsStatus === 'succeeded' || savedArticles.length > 0,
    // Add other default fields to satisfy the type
    ids: [],
    currentPage: 1,
    pageSize: 20,
    nextPageKey: null,
    prevPageKey: null,
    totalCount: savedArticles.length,
    hasReachedEnd: true,
    lastSuccessfulFetchAt: null
  }

  if (isAuthLoading || !isAuthenticated || !userState) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    )
  }

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
        },
        {
          id: 'exercises',
          label: 'Exercises Done',
          value: progressSummary.exercises_completed_count,
          icon: <Zap size={18} color={Colors.light.success} />
        }
      ]
    : []

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/(main)/settings/')}
        >
          <Settings size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent,
          { paddingBottom: floatingTabBarHeight + 20 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: `https://picsum.photos/seed/${userState?.id}/160/160`
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {nameParser(userState?.displayName || 'User', {
                maxLen: 32
              })}
            </Text>
            <Text style={styles.profileSubtitle}>
              Learning Finnish • Beginner
            </Text>
            <View style={styles.learningStatus}>
              <View style={styles.progressContainer}>
                <ProgressRing
                  progress={progressSummary?.progress_to_next_level ?? 0}
                  size={60}
                  strokeWidth={6}
                  color={Colors.light.primary}
                />
                <View style={styles.progressTextContainer}>
                  {progressSummary ? (
                    <>
                      <Text style={styles.progressPercentage}>
                        {Math.round(
                          (progressSummary.progress_to_next_level ?? 0) * 100
                        )}
                        %
                      </Text>
                      <Text style={styles.progressLabel}>
                        Level {progressSummary.level}
                      </Text>
                    </>
                  ) : progressStatus === 'loading' ? (
                    <ActivityIndicator size="small" />
                  ) : null}
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

        {progressSummary?.category_progress &&
          progressSummary.category_progress.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Time Spent by Category</Text>
              </View>
              <View style={styles.categoryProgressContainer}>
                {progressSummary.category_progress.map(catProg => (
                  <View key={catProg.category} style={styles.categoryItem}>
                    <Text style={styles.categoryName}>{catProg.category}</Text>
                    <View style={styles.categoryBarContainer}>
                      <View
                        style={[
                          styles.categoryBar,
                          {
                            width: `${Math.min(
                              100,
                              (catProg.time_spent_minutes /
                                (progressSummary.total_study_time_minutes ||
                                  1)) *
                                100
                            )}%`
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryTime}>
                      {catProg.time_spent_minutes} min
                    </Text>
                  </View>
                ))}
                <View style={styles.totalTimeContainer}>
                  <Clock size={16} color={Colors.light.textSecondary} />
                  <Text style={styles.totalTimeText}>
                    Total Study Time: {progressSummary.total_study_time_minutes}{' '}
                    minutes
                  </Text>
                </View>
              </View>
            </View>
          )}

        {/* --- REPLACED SECTION FOR SAVED ARTICLES --- */}
        <View style={styles.savedArticlesSection}>
          <FeaturedArticles
            title="My Library"
            viewAllPath="/(main)/saved-articles"
            articles={savedArticles}
            pagination={savedArticlesPagination}
            marginHorizontal={20}
            onLoadMore={() => {}} // No pagination for this list on this screen
          />
        </View>

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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Link href="/(main)/achievements" asChild>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View all</Text>
              </TouchableOpacity>
            </Link>
          </View>
          {achievementsStatus === 'loading' &&
            earnedAchievements.length === 0 && <ActivityIndicator />}
          {achievementsStatus === 'failed' && (
            <Text style={styles.errorTextSmall}>
              Failed to load achievements
            </Text>
          )}
          {achievementsStatus === 'succeeded' &&
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
              {earnedAchievements.slice(0, 4).map(achievement => (
                <AchievementCard
                  key={achievement.achievement_id}
                  achievement={achievement}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.background
  },
  screenTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.light.text
  },
  settingsButton: {
    borderRadius: 22,
    backgroundColor: Colors.light.background,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    padding: 10
  },
  scrollContent: {
    paddingHorizontal: 20
  },
  wideScreenContent: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%'
  },
  profileSection: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start'
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.common.white
  },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 2
  },
  profileSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 10
  },
  learningStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressTextContainer: { marginLeft: 10, alignItems: 'flex-start' },
  progressPercentage: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: Colors.light.primary
  },
  progressLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.light.textSecondary
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.light.border,
    marginHorizontal: 16
  },
  streakContainer: { alignItems: 'center' },
  streakValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 4
  },
  streakLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.light.textSecondary
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 24,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-around'
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 17,
    color: Colors.light.text
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 2
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 19,
    color: Colors.light.text
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 2
  },
  vocabularyCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
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
    marginBottom: 2
  },
  vocabularyCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary
  },
  practiceButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  practiceButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.primaryContent
  },
  emptySectionText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
    paddingVertical: 30,
    fontSize: 14
  },
  errorTextSmall: {
    fontSize: 13,
    color: Colors.light.error,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 10,
    fontFamily: 'Inter-Regular'
  },
  categoryProgressContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderSubtle
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    width: 100
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden'
  },
  categoryBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4
  },
  categoryTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    minWidth: 60,
    textAlign: 'right'
  },
  totalTimeContainer: {
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
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6 // Gutter compensation
  },
  wideScreenAchievements: {
    justifyContent: 'flex-start'
  },
  savedArticlesSection: {
    marginHorizontal: -20
  }
})
