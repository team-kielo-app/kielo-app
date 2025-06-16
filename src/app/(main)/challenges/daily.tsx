// src/app/(main)/challenges/daily.tsx
import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, useRouter, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  CheckCircle,
  PlayCircle,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  Sparkles
} from 'lucide-react-native'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchDailyChallengeThunk,
  updateDailyChallengeStatusThunk,
  markChallengeSectionCompleted,
  selectCurrentDailyChallenge,
  selectDailyChallengeFetchStatus,
  selectDailyChallengeFetchError
} from '@features/challenges/challengesSlice'
import {
  ChallengeNSRSection,
  ChallengeLessonSection,
  ChallengeSection,
  ChallengeContextualPracticeSection
} from '@features/challenges/types'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { LessonData } from '@/features/lessons/types'

export default function DailyChallengeScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const challenge = useSelector(selectCurrentDailyChallenge)
  const status = useSelector(selectDailyChallengeFetchStatus)
  const error = useSelector(selectDailyChallengeFetchError)

  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(
    null
  )

  useEffect(() => {
    if (status === 'idle' && !challenge) {
      dispatch(fetchDailyChallengeThunk())
    }
  }, [dispatch, status, challenge])

  // useEffect to determine if challenge is newly completed (client-side check)
  // This can trigger the "Mark Challenge Complete" button visibility.
  // Or directly call updateDailyChallengeStatusThunk to 'completed' if all sections are done.
  useEffect(() => {
    if (challenge && challenge.status !== 'completed') {
      const allLocallyCompleted = challenge.sections.every(s => s.is_completed)
      if (allLocallyCompleted) {
        console.log('All challenge sections marked complete locally.')
        // Optionally, automatically trigger completion API call
        // dispatch(updateDailyChallengeStatusThunk({ challengeId: challenge.challenge_id, newStatus: 'completed' }));
      }
    }
  }, [challenge, dispatch])

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
      challenge_section_array_index: String(sectionArrayIndex) // Pass array index
    }

    if (section.type === 'spaced_repetition_review') {
      router.push({
        pathname: '/(main)/exercises/review-session',
        params: commonParams
      })
    } else if (
      section.type === 'targeted_weakness_practice' ||
      section.type === 'lesson_practice'
    ) {
      const lessonSection = section as ChallengeLessonSection
      const lessonData = lessonSection.lesson_details // +++ CHANGE to "lesson_details"
      console.log('Navigating to Player (Lesson Section):', section.title)
      console.log(
        'Lesson Data to Stringify:',
        JSON.stringify(lessonData, null, 2)
      )
      if (!lessonData || !lessonData.exercises) {
        console.error(
          'ERROR: lesson_details or lesson_details.exercises is missing for targeted_weakness_practice!'
        )
        return
      }
      router.push({
        pathname: '/(main)/exercises/player',
        params: {
          lessonDataString: JSON.stringify(lessonData),
          ...commonParams
        }
      })
    } else if (section.type === 'contextual_practice') {
      const contextualSection = section as ChallengeContextualPracticeSection
      const lessonDataForPlayer: LessonData = {
        lesson_id: `challenge_contextual_${
          challenge?.challenge_id || 'unknown'
        }_${sectionArrayIndex}`,
        lesson_title: section.title,
        description: 'Practice items related to your recent activity.',
        exercises: contextualSection.exercises,
        user_id: challenge?.user_id || ''
        // estimated_duration_minutes: // calculate or omit - ensure LessonData type allows optional
      }
      console.log('Navigating to Player (Contextual Section):', section.title)
      console.log(
        'Lesson Data to Stringify (Contextual):',
        JSON.stringify(lessonDataForPlayer, null, 2)
      ) // +++ Log the data
      if (!lessonDataForPlayer.exercises) {
        console.error(
          'ERROR: contextualSection.exercises is missing for contextual_practice!'
        )
        return
      }
      router.push({
        pathname: '/(main)/exercises/player',
        params: {
          lessonDataString: JSON.stringify(lessonDataForPlayer),
          ...commonParams
        }
      })
    }
  }

  const handleCompleteChallenge = () => {
    if (challenge) {
      dispatch(
        updateDailyChallengeStatusThunk({
          challengeId: challenge.challenge_id,
          newStatus: 'completed'
        })
      )
    }
  }

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.infoText}>Loading Daily Challenge...</Text>
      </SafeAreaView>
    )
  }

  if (status === 'failed' || !challenge) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ScreenHeader title="Daily Challenge" fallbackPath="/(main)/(tabs)/" />
        <AlertTriangle
          size={40}
          color={Colors.light.error}
          style={{ marginBottom: 10 }}
        />
        <Text style={styles.errorText}>Could not load challenge: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchDailyChallengeThunk())}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const allSectionsCompleted = challenge.sections.every(s => s.is_completed)

  if (
    challenge.status === 'completed' ||
    (allSectionsCompleted && status === 'succeeded')
  ) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ScreenHeader
          title="Challenge Complete!"
          fallbackPath="/(main)/(tabs)/"
        />
        <CheckCircle
          size={60}
          color={Colors.light.success}
          style={{ marginBottom: 20 }}
        />
        <Text style={styles.pageTitle}>Challenge Complete!</Text>
        <Text style={styles.infoText}>{challenge.title}</Text>
        <Text style={styles.infoText}>
          You earned {challenge.total_reward_points || 0} points!
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.replace('/(main)/(tabs)/')}
        >
          <Text style={styles.actionButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Daily Challenge' }} />
      <ScreenHeader title="Daily Challenge" fallbackPath="/(main)/(tabs)/" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.challengeHeader}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDate}>
            {new Date(challenge.challenge_date).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          {challenge.estimated_total_time_minutes && (
            <Text style={styles.challengeMeta}>
              Approx. {challenge.estimated_total_time_minutes} min
            </Text>
          )}
        </View>

        {challenge.sections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sectionCard,
              section.is_completed && styles.sectionCompleted
            ]}
            onPress={() =>
              !section.is_completed && handleStartSection(section, index)
            }
            disabled={section.is_completed}
          >
            <View style={styles.sectionIconContainer}>
              {section.type === 'spaced_repetition_review' && (
                <BookOpen
                  size={22}
                  color={
                    section.is_completed
                      ? Colors.light.success
                      : Colors.light.primary
                  }
                />
              )}
              {(section.type === 'targeted_weakness_practice' ||
                section.type === 'lesson_practice') && (
                <PlayCircle
                  size={22}
                  color={
                    section.is_completed
                      ? Colors.light.success
                      : Colors.light.accent
                  }
                />
              )}
              {section.type === 'contextual_practice' && (
                <Sparkles
                  size={22}
                  color={
                    section.is_completed
                      ? Colors.light.success
                      : Colors.light.warning
                  }
                />
              )}
            </View>
            <View style={styles.sectionTextContainer}>
              <Text style={styles.sectionTitleText}>{section.title}</Text>
              {/* Subtitles */}
              {section.type === 'targeted_weakness_practice' &&
                (section as ChallengeLessonSection).lesson_data && (
                  <Text style={styles.sectionSubtitle}>
                    Lesson:{' '}
                    {
                      (section as ChallengeLessonSection).lesson_data
                        .lesson_title
                    }
                  </Text>
                )}
              {section.type === 'contextual_practice' &&
                (section as ChallengeContextualPracticeSection).exercises && (
                  <Text style={styles.sectionSubtitle}>
                    Practice{' '}
                    {
                      (section as ChallengeContextualPracticeSection).exercises
                        .length
                    }{' '}
                    quick items
                  </Text>
                )}
              {section.type === 'spaced_repetition_review' &&
                (section as ChallengeNSRSection).target_review_count && (
                  <Text style={styles.sectionSubtitle}>
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
            disabled={status === 'loading'} // Disable if challenge status update is in progress
          >
            {status === 'loading' ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.actionButtonText}>
                Mark Challenge Complete
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 15,
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
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20
  },
  actionButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },

  challengeHeader: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: 'center'
  },
  challengeTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center'
  },
  challengeDate: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  challengeMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary
  },
  sectionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2
  },
  sectionCompleted: {
    opacity: 0.7,
    backgroundColor: Colors.light.successLight, // Indicate completion
    borderColor: Colors.light.success,
    borderWidth: 1
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  sectionTextContainer: {
    flex: 1,
    marginRight: 8
  },
  sectionTitleText: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 2
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  completeChallengeButton: {
    backgroundColor: Colors.light.success,
    marginTop: 20
  }
})
