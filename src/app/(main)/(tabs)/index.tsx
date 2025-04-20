import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ChevronRight,
  Star,
  TrendingUp,
  Trophy,
  LogIn
} from 'lucide-react-native'
import { Link, useRouter } from 'expo-router'
import { useSelector, useDispatch } from 'react-redux'

import { DailyGoalChart } from '@components/home/DailyGoalChart' // Assuming component exists
import { ProgressCard } from '@components/home/ProgressCard' // Assuming component exists
import { ArticleThumbnail } from '@components/reader/ArticleThumbnail' // Assuming component exists
import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { selectIsAuthenticated, selectUser } from '@features/auth/authSelectors'
import { fetchArticles } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectPaginatedData } from '@pagination/selectors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { nameParser } from '@utils/string'

// Filled from original file
const weeklyProgress = [
  { day: 'Mon', minutes: 12 },
  { day: 'Tue', minutes: 18 },
  { day: 'Wed', minutes: 8 },
  { day: 'Thu', minutes: 22 },
  { day: 'Fri', minutes: 15 },
  { day: 'Sat', minutes: 10 },
  { day: 'Sun', minutes: 5 }
]

export default function HomeScreen() {
  const router = useRouter()
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
      true
    )(state)
  )

  const [streakDays, setStreakDays] = useState(7) // Mock streak

  // Fetch articles logic (consider fetching strategy based on auth)
  useEffect(() => {
    if (!pagination.isLoading && !pagination.error && articles.length < 5) {
      dispatch(fetchArticles(paginationKey, { reset: true }))
    }
  }, [dispatch, userState?.id, articles.length])

  // Guarded action for starting a challenge
  const startChallengeAction = (challengeId: string) => {
    alert(`Starting challenge ${challengeId} (Not Implemented)`)
  }
  const handleStartChallenge = useRequireAuthAction(
    startChallengeAction,
    'Login to start the daily challenge.'
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        // showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.wideScreenContent
        ]}
      >
        {/* --- Profile Section --- */}
        <View style={styles.profileSection}>
          <View style={styles.headerTextContainer}>
            {isAuthenticated && userState ? (
              <>
                <Text style={styles.headerTitle}>
                  Hei{' '}
                  {nameParser(userState?.displayName || 'Duy Khanh Le', {
                    ellipsis: ''
                  })}
                  ! 👋
                </Text>
                <Text style={styles.headerSubtitle}>
                  Let's learn some Finnish today
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.headerTitle}>Tervetuloa! 👋</Text>
                <Text style={styles.headerSubtitle}>
                  Login to track your progress
                </Text>
              </>
            )}
          </View>
          {isAuthenticated && userState ? (
            <TouchableOpacity
              onPress={() => router.push('/(main)/(tabs)/profile')}
            >
              <Image
                source={{
                  uri: `https://picsum.photos/seed/${userState.id}/80/80`
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.loginButton}
            >
              <LogIn size={20} color={Colors.light.primary} />
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* --- Streak & Progress --- */}
        {isAuthenticated && (
          <>
            <View style={[styles.streakContainer, { marginBottom: 24 }]}>
              <View style={styles.streakInfo}>
                <Trophy size={20} color={Colors.light.accent} />
                <Text style={styles.streakText}>
                  {' '}
                  {streakDays} day streak! Keep it up!
                </Text>
              </View>
              <DailyGoalChart data={weeklyProgress} />
            </View>

            <View
              style={[styles.section, isDesktop && styles.wideScreenSection]}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Progress</Text>
                <Link href="/(main)/progress-details" asChild>
                  <TouchableOpacity style={styles.seeAllButton}>
                    <Text style={styles.seeAllText}>See all</Text>
                    <ChevronRight
                      size={16}
                      color={Colors.light.textSecondary}
                    />
                  </TouchableOpacity>
                </Link>
              </View>
              <View style={styles.progressCardsContainer}>
                <ProgressCard
                  icon={<Star size={20} color={Colors.light.primary} />}
                  title="Vocabulary"
                  subtitle="145 words learned"
                  progress={0.45}
                  color={Colors.light.primary}
                />
                <ProgressCard
                  icon={<TrendingUp size={20} color={Colors.light.accent} />}
                  title="Reading"
                  subtitle="12 articles completed"
                  progress={0.7}
                  color={Colors.light.accent}
                />
              </View>
            </View>
          </>
        )}

        {/* --- Featured Articles (Public) --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Articles</Text>
            <Link href="/(main)/(tabs)/reader" asChild>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See all</Text>
                <ChevronRight size={16} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </Link>
          </View>
          <FlatList
            data={articles.slice(0, 5)}
            keyExtractor={item => item.id}
            horizontal
            // showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ArticleThumbnail article={item} />}
            contentContainerStyle={styles.articleList}
            style={{ marginTop: 16 }}
          />
        </View>

        {/* --- Daily Challenge --- */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Challenge</Text>
          </View>
          <TouchableOpacity
            style={styles.challengeCard}
            onPress={() => handleStartChallenge('news_article_challenge')}
          >
            <View style={styles.challengeContent}>
              <View style={styles.challengeIconContainer}>
                <Trophy size={24} color={Colors.light.white} />
              </View>
              <View style={styles.challengeTextContainer}>
                <Text style={styles.challengeTitle}>
                  Complete a News Article
                </Text>
                <Text style={styles.challengeSubtitle}>
                  Read and learn 5 new words
                </Text>
              </View>
            </View>
            <View style={styles.challengeContentRight}>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'column'
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerTextContainer: { flex: 1, marginRight: 16 }, // Adjusted for spacing
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: Colors.light.text,
    marginBottom: 4
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.textSecondary
  },
  profileImage: { width: 50, height: 50, borderRadius: 25 }, // Adjusted size
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  loginButtonText: {
    marginLeft: 6,
    color: Colors.light.primary,
    fontWeight: '500',
    fontFamily: 'Inter-Medium'
  }, // Added font
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
    flexDirection: 'column'
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
    color: Colors.light.primary, // Changed color
    marginRight: 2
  },
  progressCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12 // Added gap
  },
  articleList: {
    paddingRight: 20 // Ensures last item isn't cut off visually
  },
  challengeCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: '100%'
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8
  },
  challengeContentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 8
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  challengeTextContainer: {
    flex: 1
  },
  challengeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  challengeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  }
})
