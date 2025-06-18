import React, { useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  RefreshControl
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import {
  CheckCircle,
  PlayCircle,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  ChevronLeft
} from 'lucide-react-native'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchDailyChallengeThunk,
  updateDailyChallengeStatusThunk,
  selectCurrentDailyChallenge,
  selectDailyChallengeFetchStatus,
  selectDailyChallengeFetchError
} from '@features/challenges/challengesSlice'
import {
  ChallengeSection,
  ChallengeLessonSection,
  ChallengeContextualPracticeSection,
  ChallengeNSRSection
} from '@features/challenges/types'
import { Colors } from '@constants/Colors'
import { LessonData } from '@/features/lessons/types'
import { useRefresh } from '@/hooks/useRefresh'

export default function DailyChallengeScreen(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const challenge = useSelector(selectCurrentDailyChallenge)
  const status = useSelector(selectDailyChallengeFetchStatus)
  const error = useSelector(selectDailyChallengeFetchError)

  const fetchChallengeData = useCallback(() => {
    if (status === 'idle' && !challenge) {
      return dispatch(fetchDailyChallengeThunk())
    }
    if (challenge) {
      return dispatch(fetchDailyChallengeThunk())
    }
    return Promise.resolve()
  }, [dispatch, status, challenge])

  useEffect(() => {
    if (status === 'idle' && !challenge) {
      fetchChallengeData()
    }
  }, [fetchChallengeData, status, challenge])

  const [isRefreshing, handleRefresh] = useRefresh(fetchChallengeData)

  const handleStartSection = (
    section: ChallengeSection,
    sectionArrayIndex: number
  ) => {
    if (!challenge) return

    if (challenge.status === 'generated') {
      dispatch(
        updateDailyChallengeStatusThunk({
          challengeId: challenge.challenge_id,
          newStatus: 'started'
        })
      )
    }

    const commonParams = {
      challenge_id: challenge.challenge_id,
      challenge_section_array_index: String(sectionArrayIndex)
    }

    let path = ''
    let params: Record<string, string | undefined> = { ...commonParams }

    if (section.type === 'spaced_repetition_review') {
      path = '/(main)/exercises/review-session'
    } else if (
      section.type === 'targeted_weakness_practice' ||
      section.type === 'lesson_practice'
    ) {
      const lessonSection = section as ChallengeLessonSection
      if (
        !lessonSection.lesson_details ||
        !lessonSection.lesson_details.exercises
      ) {
        console.error(
          'ERROR: lesson_details or exercises missing for lesson section!'
        )
        return
      }
      path = '/(main)/exercises/player'
      params.lessonDataString = JSON.stringify(lessonSection.lesson_details)
    } else if (section.type === 'contextual_practice') {
      const contextualSection = section as ChallengeContextualPracticeSection
      if (!contextualSection.exercises) {
        console.error(
          'ERROR: exercises missing for contextual_practice section!'
        )
        return
      }
      const lessonDataForPlayer: LessonData = {
        lesson_id: `challenge_contextual_${challenge?.challenge_id}_${sectionArrayIndex}`,
        lesson_title: section.title,
        description: 'Practice items related to your recent activity.',
        exercises: contextualSection.exercises,
        user_id: challenge?.user_id || ''
      }
      path = '/(main)/exercises/player'
      params.lessonDataString = JSON.stringify(lessonDataForPlayer)
    } else {
      console.warn(
        'Unhandled challenge section type for navigation:',
        section.type
      )
      return
    }
    router.push({ pathname: path, params })
  }

  const handleCompleteChallenge = () => {
    if (challenge && challenge.status !== 'completed') {
      dispatch(
        updateDailyChallengeStatusThunk({
          challengeId: challenge.challenge_id,
          newStatus: 'completed'
        })
      )
    }
  }

  const handleGoBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(main)/(tabs)/')
  }

  if (status === 'loading') {
    return (
      <LinearGradient
        colors={[Colors.light.accentGreenLight, Colors.light.background]}
        style={styles.gradientBackgroundFull}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      >
        <SafeAreaView style={styles.containerCentered}>
          <ActivityIndicator size="large" color={Colors.light.accentGreen} />
          <Text
            style={[styles.infoText, { color: Colors.light.textSecondary }]}
          >
            Loading Daily Challenge...
          </Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  if (status === 'failed' || !challenge) {
    return (
      <LinearGradient
        colors={[Colors.light.accentGreenLight, Colors.light.background]}
        style={styles.gradientBackgroundFull}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      >
        <SafeAreaView style={styles.containerCentered}>
          <View
            style={[
              styles.customHeader,
              { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
            ]}
          >
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerBackButton}
            >
              <ChevronLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Challenge</Text>
            <View style={{ width: 30 }} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20
            }}
          >
            <AlertTriangle
              size={40}
              color={Colors.light.error}
              style={{ marginBottom: 10 }}
            />
            <Text style={styles.errorText}>
              Could not load challenge: {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(fetchDailyChallengeThunk())}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const allSectionsCompleted = challenge.sections.every(s => s.is_completed)

  if (
    challenge.status === 'completed' ||
    (allSectionsCompleted && status === 'succeeded')
  ) {
    return (
      <LinearGradient
        colors={[Colors.light.accentGreenLight, Colors.light.background]}
        style={styles.gradientBackgroundFull}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      >
        <SafeAreaView style={styles.containerCentered}>
          <View
            style={[
              styles.customHeader,
              { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
            ]}
          >
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.headerBackButton}
            >
              <ChevronLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Challenge Complete!</Text>
            <View style={{ width: 30 }} />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20
            }}
          >
            <CheckCircle
              size={60}
              color={Colors.light.success}
              style={{ marginBottom: 20 }}
            />
            <Text style={styles.pageTitle}>Challenge Complete!</Text>
            <Text style={styles.infoTextNormal}>{challenge.title}</Text>
            <Text style={styles.infoTextNormal}>
              You earned {challenge.total_reward_points || 0} points!
            </Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors.light.accentGreen }
              ]}
              onPress={() => router.replace('/(main)/(tabs)/')}
            >
              <Text style={styles.actionButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  function getSectionIcon(sectionType: string, isCompleted?: boolean) {
    const color = isCompleted ? Colors.common.white : Colors.light.accentGreen
    switch (sectionType) {
      case 'spaced_repetition_review':
        return <BookOpen size={22} color={color} />
      case 'targeted_weakness_practice':
      case 'lesson_practice':
        return <PlayCircle size={22} color={color} />
      case 'contextual_practice':
        return <Sparkles size={22} color={color} />
      default:
        return <PlayCircle size={22} color={color} />
    }
  }

  return (
    <LinearGradient
      colors={[Colors.light.accentGreenLight, Colors.light.background]}
      style={styles.gradientBackgroundFull}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.4 }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[
            styles.customHeader,
            { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
          ]}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerBackButton}
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Challenge</Text>
          <View style={{ width: 30 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.accentGreen}
            />
          }
        >
          <View style={styles.challengeHeaderInfo}>
            <Text style={styles.challengeTitleText}>{challenge.title}</Text>
            <Text style={styles.challengeDateText}>
              {new Date(challenge.challenge_date).toLocaleDateString('en-GB', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            {challenge.estimated_total_time_minutes && (
              <Text style={styles.challengeMetaText}>
                Approx. {challenge.estimated_total_time_minutes} min
              </Text>
            )}
          </View>

          {challenge.sections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sectionCard,
                section.is_completed && styles.sectionCompletedCard
              ]}
              onPress={() =>
                !section.is_completed && handleStartSection(section, index)
              }
              disabled={section.is_completed}
            >
              <View
                style={[
                  styles.sectionIconContainer,
                  section.is_completed && {
                    backgroundColor: Colors.light.success
                  }
                ]}
              >
                {getSectionIcon(section.type, section.is_completed)}
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitleCardText}>{section.title}</Text>
                {section.type === 'targeted_weakness_practice' &&
                  (section as ChallengeLessonSection).lesson_details && (
                    <Text style={styles.sectionSubtitleText}>
                      Lesson:{' '}
                      {
                        (section as ChallengeLessonSection).lesson_details
                          .lesson_title
                      }
                    </Text>
                  )}
                {section.type === 'contextual_practice' &&
                  (section as ChallengeContextualPracticeSection).exercises && (
                    <Text style={styles.sectionSubtitleText}>
                      Practice{' '}
                      {
                        (section as ChallengeContextualPracticeSection)
                          .exercises.length
                      }{' '}
                      quick items
                    </Text>
                  )}
                {section.type === 'spaced_repetition_review' &&
                  (section as ChallengeNSRSection).target_review_count && (
                    <Text style={styles.sectionSubtitleText}>
                      Complete{' '}
                      {(section as ChallengeNSRSection).target_review_count}{' '}
                      reviews
                    </Text>
                  )}
              </View>
              {section.is_completed ? (
                <CheckCircle size={24} color={Colors.light.success} />
              ) : (
                <ChevronRight size={20} color={Colors.light.textSecondary} />
              )}
            </TouchableOpacity>
          ))}

          {allSectionsCompleted && challenge.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeChallengeButton]}
              onPress={handleCompleteChallenge}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color={Colors.light.primaryContent} />
              ) : (
                <Text style={styles.actionButtonText}>
                  Mark Challenge Complete
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackgroundFull: { flex: 1 },
  container: { flex: 1 },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 10
  },
  headerBackButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 10
  },
  infoTextNormal: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: Colors.light.accentGreen,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25
  },
  retryButtonText: {
    color: Colors.light.primaryContent,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 24,
    alignSelf: 'center'
  },
  actionButtonText: {
    color: Colors.light.primaryContent,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  challengeHeaderInfo: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSubtle,
    alignItems: 'center'
  },
  challengeTitleText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 6,
    textAlign: 'center'
  },
  challengeDateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  challengeMetaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.accentGreen
  },
  sectionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.borderSubtle
  },
  sectionCompletedCard: {
    opacity: 0.8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderColor: Colors.light.success
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accentGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sectionTextContainer: {
    flex: 1,
    marginRight: 8
  },
  sectionTitleCardText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 3
  },
  sectionSubtitleText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  completeChallengeButton: {
    backgroundColor: Colors.light.success,
    marginTop: 24
  }
})
