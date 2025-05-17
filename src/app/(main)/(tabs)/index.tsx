import React, { useCallback, useEffect } from 'react'
import { StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector, useDispatch } from 'react-redux'

import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { selectIsAuthenticated, selectUser } from '@features/auth/authSelectors'
import { fetchArticles } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectPaginatedData } from '@pagination/selectors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { useRefresh } from '@hooks/useRefresh'
import { fetchProgressThunk } from '@features/progress/progressActions'
import {
  selectProgressSummary,
  selectProgressStatus
} from '@features/progress/progressSlice'

import { HomeHeader } from '@/components/home/HomeHeader'
import { UserProgressSummary } from '@/components/home/UserProgressSummary'
import { FeaturedArticles } from '@/components/home/FeaturedArticles'
import { DailyChallenge } from '@/components/home/DailyChallenge'

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userState = useSelector((state: RootState) => selectUser(state))

  const paginationKey = isAuthenticated
    ? `${userState?.id}-articles-feed`
    : 'articlesPublic'
  const { data: articles, pagination } = useSelector((state: RootState) =>
    selectPaginatedData(
      'articles',
      'articlePagination',
      paginationKey,
      false
    )(state)
  )

  const progressSummary = useSelector(selectProgressSummary)
  const progressStatus = useSelector(selectProgressStatus)

  useEffect(() => {
    if (!pagination.isLoading && !pagination.error && articles.length < 5) {
      dispatch(fetchArticles(paginationKey, { reset: true }))
    }
    if (isAuthenticated && progressStatus === 'idle') {
      dispatch(fetchProgressThunk())
    }
  }, [dispatch, paginationKey, progressStatus])

  const handleRefreshAction = useCallback(async () => {
    console.log('HomeScreen: Refreshing...')
    const promises: Promise<any>[] = [
      dispatch(fetchArticles(paginationKey, { reset: true }))
    ]
    if (isAuthenticated) {
      promises.push(dispatch(fetchProgressThunk()))
    }
    await Promise.all(promises)
  }, [dispatch, paginationKey, isAuthenticated])

  const [isRefreshing, handleRefresh] = useRefresh(handleRefreshAction)

  const startChallengeAction = useCallback((challengeId: string) => {
    alert(`Starting challenge ${challengeId} (Not Implemented)`)
  }, [])

  const handleStartChallenge = useRequireAuthAction(
    startChallengeAction,
    'Login to start the daily challenge.'
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
      >
        <HomeHeader isAuthenticated={isAuthenticated} user={userState} />

        <UserProgressSummary
          progressSummary={progressSummary}
          progressStatus={progressStatus}
          isDesktop={isDesktop}
        />
        <FeaturedArticles articles={articles} pagination={pagination} />

        <DailyChallenge onStartChallenge={handleStartChallenge} />
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
  centeredSection: {
    // Style for centering loading/error within a section
    height: 150, // Give it some height
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  }
})
