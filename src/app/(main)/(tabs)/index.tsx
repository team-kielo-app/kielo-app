import React, { useCallback, useEffect } from 'react'
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  View,
  Text,
  Alert
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector, useDispatch } from 'react-redux'
import { LinearGradient } from 'expo-linear-gradient'
import { LearningModuleCard } from '@/components/home/LearningModuleCard'

import { Colors } from '@constants/Colors'
import { selectIsAuthenticated, selectUser } from '@features/auth/authSelectors'
import { AppDispatch, RootState } from '@store/store'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { useRefresh } from '@hooks/useRefresh'
import { fetchProgressThunk } from '@features/progress/progressActions'
import {
  selectProgressSummary,
  selectProgressStatus
} from '@features/progress/progressSlice'
import { useRouter } from 'expo-router'

import { HomeHeader } from '@/components/home/HomeHeader'
import { StreakCard } from '@/components/home/StreakCard'
import { DailyGoalCard } from '@/components/home/DailyGoalCard'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { fetchArticles } from '@/features/articles/articlesActions'
import { selectPaginatedData } from '@/pagination/selectors'

const HOME_FEATURED_ARTICLES_KEY = 'home-featured-articles'

export default function HomeScreen(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const progressSummary = useSelector(selectProgressSummary)
  const progressStatus = useSelector(selectProgressStatus)

  const { data: featuredArticles, pagination: featuredArticlesPagination } =
    useSelector((state: RootState) =>
      selectPaginatedData(
        'articles', // entityName for normalizr
        'articlePagination', // paginationType in pagination slice
        HOME_FEATURED_ARTICLES_KEY, // Specific key for this list
        false // isAccumulated: false, typically for feeds that reset
      )(state)
    )

  const handleLoadMoreFeaturedArticles = () => {
    if (
      !featuredArticlesPagination.isLoading &&
      featuredArticlesPagination.hasMore
    ) {
      dispatch(
        fetchArticles(HOME_FEATURED_ARTICLES_KEY, {
          fetchNext: true
        })
      )
    }
  }

  const fetchHomeScreenData = useCallback(async () => {
    const promises: Promise<any>[] = []
    if (
      isAuthenticated &&
      (progressStatus === 'idle' || progressStatus === 'failed')
    ) {
      promises.push(dispatch(fetchProgressThunk()))
    }
    // Fetch featured articles if not already loading or fetched (or if forcing refresh)
    if (
      !featuredArticlesPagination.isLoading &&
      (!featuredArticlesPagination.hasFetched ||
        featuredArticlesPagination.error)
    ) {
      promises.push(
        dispatch(
          fetchArticles(HOME_FEATURED_ARTICLES_KEY, {
            reset: true
          })
        )
      )
    }
    if (promises.length > 0) {
      try {
        await Promise.all(promises)
      } catch (e) {
        console.error('Error fetching home screen data:', e)
      }
    }
  }, [
    dispatch,
    isAuthenticated,
    progressStatus,
    featuredArticlesPagination.isLoading,
    featuredArticlesPagination.hasFetched,
    featuredArticlesPagination.error
  ])

  useEffect(() => {
    fetchHomeScreenData()
  }, [fetchHomeScreenData])

  const [isRefreshing, handleRefresh] = useRefresh(fetchHomeScreenData)

  const navigateToFlashcards = useRequireAuthAction(
    () => router.push('/(main)/exercises/review-session'),
    'Login to review flashcards.'
  )
  const navigateToQuiz = useRequireAuthAction(() => {
    router.push('/(main)/challenges/daily')
  }, 'Login to play quiz games.')

  const navigateToNewWordsAndPronunciation = useRequireAuthAction(() => {
    router.push('/(main)/(tabs)/exercises')
  }, 'Login to learn new words or practice pronunciation.')

  return (
    <LinearGradient
      colors={[
        Colors.light.screenBackgroundGradientFrom,
        Colors.light.screenBackgroundGradientTo
      ]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 90 }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader user={user} />
          <StreakCard progressSummary={progressSummary} />
          <DailyGoalCard progressSummary={progressSummary} />

          <FeaturedArticles
            articles={featuredArticles}
            pagination={featuredArticlesPagination}
            onLoadMore={handleLoadMoreFeaturedArticles} // Pass load more handler
          />

          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <View style={styles.modulesGrid}>
            <LearningModuleCard
              title="Flashcards"
              description="Review today's words"
              iconUrl="https://cdn-icons-png.flaticon.com/512/2490/2490396.png"
              backgroundColor={Colors.light.moduleFlashcardBg}
              onPress={navigateToFlashcards}
            />
            <LearningModuleCard
              title="Quiz Game"
              description="Test your knowledge"
              iconUrl="https://cdn-icons-png.flaticon.com/512/3341/3341505.png"
              backgroundColor={Colors.light.moduleQuizBg}
              onPress={navigateToQuiz}
            />
            <LearningModuleCard
              title="New Words"
              description="Learn something new"
              iconUrl="https://cdn-icons-png.flaticon.com/512/4456/4456136.png"
              backgroundColor={Colors.light.moduleNewWordsBg}
              onPress={navigateToNewWordsAndPronunciation}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 120 },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    color: Colors.light.text,
    marginBottom: 16,
    fontSize: 20
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  }
})
