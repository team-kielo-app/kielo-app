import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { AchievementCard } from '@/components/profile/AchievementCard'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import {
  selectEarnedAchievements,
  selectAchievementsStatus
} from '@features/achievements/achievementsSlice'
import { useRefresh } from '@hooks/useRefresh'
import { fetchEarnedAchievementsThunk } from '@/features/achievements/achievementsActions'

export default function AchievementsScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const insets = useSafeAreaInsets()

  const earnedAchievements = useSelector(selectEarnedAchievements)
  const achievementsStatus = useSelector(selectAchievementsStatus)

  const fetchData = useCallback(() => {
    if (
      isAuthenticated &&
      (achievementsStatus === 'idle' || achievementsStatus === 'failed')
    ) {
      dispatch(fetchEarnedAchievementsThunk())
    }
  }, [dispatch, isAuthenticated, achievementsStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const [isPullRefreshing, handlePullRefresh] = useRefresh(async () => {
    if (isAuthenticated) {
      await dispatch(fetchEarnedAchievementsThunk())
    }
  })

  if (isAuthLoading || !isAuthenticated) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader
          title="Achievements"
          fallbackPath="/(main)/(tabs)/profile"
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }

  const renderEmptyList = () => {
    if (achievementsStatus === 'loading') {
      return (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.infoText}>Loading achievements...</Text>
        </View>
      )
    }
    if (achievementsStatus === 'failed') {
      return (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>Could not load achievements.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (achievementsStatus === 'succeeded' && earnedAchievements.length === 0) {
      return (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.emptyText}>
            No achievements earned yet. Keep learning!
          </Text>
        </View>
      )
    }
    return null
  }

  const numColumns = isDesktop ? 3 : 2

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Achievements"
        fallbackPath="/(main)/(tabs)/profile"
      />
      <FlatList
        data={earnedAchievements}
        keyExtractor={item => item.achievement_id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <AchievementCard achievement={item} />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        numColumns={numColumns}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={Colors.light.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    padding: 16
  },
  cardWrapper: {
    flex: 1 / (useResponsiveDimensions().isDesktop ? 3 : 2),
    maxWidth: '48.5%',
    margin: '0.75%'
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    minHeight: 200
  },
  infoText: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  },
  emptyText: {
    textAlign: 'center',
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
