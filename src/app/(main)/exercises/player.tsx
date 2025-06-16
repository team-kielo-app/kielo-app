// src/app/(main)/exercises/player/[lesson_id].tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppDispatch, RootState } from '@store/store'
import { reportReviewOutcomeThunk } from '@features/reviews/reviewsSlice' // Re-evaluate if this is the right thunk
import { ReviewOutcomePayload, ReviewItem } from '@features/reviews/types' // For reportReviewOutcomeThunk args

// Import ALL exercise card components
import { FillInTheBlankExerciseCard } from '@components/exercises/FillInTheBlankExerciseCard'
import { MultipleChoiceTranslationExerciseCard } from '@components/exercises/MultipleChoiceTranslationExerciseCard'
import { SentenceConstructionExerciseCard } from '@components/exercises/SentenceConstructionExerciseCard' // Assuming this exists
import { FlashcardExerciseCard } from '@components/exercises/FlashcardExerciseCard'
import { GrammarRuleExplanationCard } from '@components/exercises/GrammarRuleExplanationCard'
import { IdentifyTheConceptExerciseCard } from '@components/exercises/IdentifyTheConceptExerciseCard'

import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@/components/common/ScreenHeader'

// Type definitions for KLearn exercises from your spec (should be in lessons/types.ts)
import {
  KLearnFlashcardExercise,
  KLearnFillInTheBlankExercise,
  KLearnMCTranslationExercise,
  KLearnSentenceConstructionExercise,
  KLearnGrammarRuleExplanationExercise,
  KLearnIdentifyTheConceptExercise,
  LessonData,
  LessonExercise
} from '@features/lessons/types'
import { markChallengeSectionCompleted } from '@/features/challenges/challengesSlice'

export default function LessonPlayerScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const allParams = useLocalSearchParams<{
    lessonDataString?: string
    challenge_id?: string
    challenge_section_array_index?: string
  }>()

  const { lessonDataString, challenge_id, challenge_section_array_index } =
    allParams

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [playerStatus, setPlayerStatus] = useState<
    'loading' | 'playing' | 'completed' | 'error'
  >('loading')
  const [exerciseResults, setExerciseResults] = useState<
    Array<{ exerciseType: string; correct: boolean }>
  >([])

  useEffect(() => {
    if (lessonDataString) {
      try {
        const parsedLesson: LessonData = JSON.parse(lessonDataString)
        if (
          parsedLesson &&
          parsedLesson.exercises &&
          parsedLesson.exercises.length > 0
        ) {
          setLesson(parsedLesson)
          setCurrentExerciseIndex(0)
          setExerciseResults([])
          setPlayerStatus('playing')
        } else {
          console.error(
            'Parsed lesson data is invalid or has no exercises:',
            parsedLesson
          )
          setPlayerStatus('error')
        }
      } catch (e) {
        console.error('Failed to parse lesson data from route params:', e)
        setPlayerStatus('error')
      }
    } else {
      console.log('LessonPlayerScreen: lessonDataString is missing.') // +++ More specific log
      setPlayerStatus('error')
    }
  }, [lessonDataString]) // Only depend on lessonDataString for parsing

  const completeLessonAndNotifyChallenge = (
    finalResults: Array<{ exerciseType: string; correct: boolean }>
  ) => {
    if (challenge_id && challenge_section_array_index !== undefined) {
      const sectionIndexNum = parseInt(challenge_section_array_index, 10)
      if (!isNaN(sectionIndexNum)) {
        console.log(
          `Lesson (part of challenge ${challenge_id}, section index ${sectionIndexNum}) completed.`
        )
        // +++ Use the imported action creator directly +++
        dispatch(
          markChallengeSectionCompleted({ sectionArrayIndex: sectionIndexNum })
        )
      }
    }

    const correctCount = finalResults.filter(r => r.correct).length
    const totalCount = lesson?.exercises.length || 0
    Alert.alert(
      'Lesson Complete!',
      `You got ${correctCount} out of ${totalCount} correct.`,
      [
        {
          text: 'OK',
          onPress: () =>
            router.canGoBack()
              ? router.back()
              : router.replace('/(main)/challenges/daily')
        }
      ] // More robust back navigation
    )
  }

  const handleAnswered = (
    isCorrect: boolean,
    userAnswer: string,
    exerciseDetails: LessonExercise
  ) => {
    const newResults = [
      ...exerciseResults,
      { exerciseType: exerciseDetails.exercise_type, correct: isCorrect }
    ]
    setExerciseResults(newResults)

    const klearnItemIdForReporting = exerciseDetails.item_id_fk
    const klearnItemTypeForReporting = exerciseDetails.item_type_fk

    if (klearnItemIdForReporting && klearnItemTypeForReporting) {
      // ... (outcome reporting logic - this part seems okay) ...
      const outcomePayload: ReviewOutcomePayload = {
        interaction_success: isCorrect,
        review_timestamp_client: new Date().toISOString(),
        review_interaction_type: exerciseDetails.exercise_type
      }
      const itemForReportingThunk: ReviewItem = {
        item_id: klearnItemIdForReporting,
        item_type: klearnItemTypeForReporting,
        display_text:
          (exerciseDetails as any).prompt ||
          lesson?.lesson_title ||
          'Exercise Item'
      }
      dispatch(
        reportReviewOutcomeThunk({
          item: itemForReportingThunk,
          outcome: outcomePayload
        })
      )
    } else {
      console.warn(
        'KLearn item_id_fk or item_type_fk missing for exercise, outcome not fully reported:',
        exerciseDetails
      )
    }

    if (lesson && currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      setPlayerStatus('completed')
      completeLessonAndNotifyChallenge(newResults)
    }
  }

  // ... (loading, error states) ...
  if (playerStatus === 'loading') {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text>Loading Lesson Data...</Text> {/* More specific loading text */}
      </SafeAreaView>
    )
  }

  if (playerStatus === 'error' || !lesson) {
    // Check playerStatus for error
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ScreenHeader title="Error" fallbackPath="/(main)/(tabs)/exercises" />
        <Text style={styles.errorText}>
          Could not load the lesson. Please ensure lesson data was passed
          correctly.
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }
  // ... (renderExercise, completed state, styles) ...
  // The completed state should be triggered by `playerStatus === 'completed'` now.
  if (playerStatus === 'completed') {
    const correctCount = exerciseResults.filter(r => r.correct).length
    const totalCount = lesson?.exercises.length || 0
    const score =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Stack.Screen options={{ title: 'Lesson Finished' }} />
        <ScreenHeader
          title="Lesson Finished!"
          fallbackPath={
            challenge_id
              ? `/(main)/challenges/daily`
              : '/(main)/(tabs)/exercises'
          }
        />
        <Text style={styles.completionTitle}>Nicely Done!</Text>
        <Text style={styles.completionScore}>
          Your score: {score}% ({correctCount}/{totalCount})
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace(
                  challenge_id
                    ? `/(main)/challenges/daily`
                    : '/(main)/(tabs)/exercises'
                )
          }
        >
          <Text style={styles.actionButtonText}>Continue</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // renderExercise and styles from previous step...
  const renderExercise = () => {
    const currentExercise = lesson?.exercises[currentExerciseIndex]

    if (!currentExercise) return <ActivityIndicator style={{ marginTop: 50 }} /> // Or a more styled placeholder
    const onAnsweredCb = (isCorrect: boolean, userAnswer: string) =>
      handleAnswered(isCorrect, userAnswer, currentExercise)

    switch (currentExercise.exercise_type) {
      case 'flashcard':
        return (
          <FlashcardExerciseCard
            exercise={currentExercise as KLearnFlashcardExercise}
            onAnswered={onAnsweredCb}
          />
        )
      case 'fill_in_the_blank':
        return (
          <FillInTheBlankExerciseCard
            exercise={currentExercise as KLearnFillInTheBlankExercise}
            onAnswered={onAnsweredCb}
          />
        )
      case 'multiple_choice_translation':
        return (
          <MultipleChoiceTranslationExerciseCard
            exercise={currentExercise as KLearnMCTranslationExercise}
            onAnswered={onAnsweredCb}
          />
        )
      case 'sentence_construction':
        return (
          <SentenceConstructionExerciseCard
            exercise={currentExercise as KLearnSentenceConstructionExercise}
            onAnswered={onAnsweredCb}
          />
        )
      case 'grammar_rule_explanation':
        return (
          <GrammarRuleExplanationCard
            exercise={currentExercise as KLearnGrammarRuleExplanationExercise}
            onAnswered={onAnsweredCb}
          />
        )
      case 'identify_the_concept':
        return (
          <IdentifyTheConceptExerciseCard
            exercise={currentExercise as KLearnIdentifyTheConceptExercise}
            onAnswered={onAnsweredCb}
          />
        )
      default:
        console.warn(
          'Unsupported exercise type from KLearn:',
          (currentExercise as any).exercise_type
        )
        return (
          <Text>
            Unsupported exercise type: {(currentExercise as any).exercise_type}
          </Text>
        )
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: lesson?.lesson_title || 'Practice' }} />
      <ScreenHeader
        title={lesson?.lesson_title || 'Practice Session'}
        fallbackPath="/(main)/(tabs)/exercises"
      />

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {playerStatus === 'playing' &&
          lesson &&
          lesson.exercises.length > 0 && (
            <>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>
                  Exercise {currentExerciseIndex + 1} of{' '}
                  {lesson.exercises.length}
                </Text>
                <View style={styles.lessonProgressBarContainer}>
                  <View
                    style={[
                      styles.lessonProgressBar,
                      {
                        width: `${
                          ((currentExerciseIndex + 1) /
                            lesson.exercises.length) *
                          100
                        }%`
                      }
                    ]}
                  />
                </View>
              </View>
              {renderExercise()}
            </>
          )}
        {playerStatus === 'playing' &&
          (!lesson || lesson.exercises.length === 0) && (
            <Text style={styles.errorText}>
              Lesson content is not available.
            </Text>
          )}
      </ScrollView>
    </SafeAreaView>
  )
}
// Styles from previous step...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background
  },
  scrollContentContainer: {
    padding: 15,
    paddingBottom: 30
  },
  progressHeader: {
    marginBottom: 15,
    alignItems: 'center'
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  lessonProgressBarContainer: {
    height: 8,
    width: '90%',
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden'
  },
  lessonProgressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 15
  },
  completionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 10,
    textAlign: 'center'
  },
  completionScore: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center'
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
  }
})
