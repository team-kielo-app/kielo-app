import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform
} from 'react-native'
import { useDispatch } from 'react-redux'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { AppDispatch } from '@store/store'
import { reportReviewOutcomeThunk } from '@features/reviews/reviewsSlice'
import { ReviewOutcomePayload, ReviewItem } from '@features/reviews/types'
import { markChallengeSectionCompleted } from '@/features/challenges/challengesSlice'
import {
  LessonData,
  LessonExercise,
  KLearnMCTranslationExercise
} from '@features/lessons/types'

import { FillInTheBlankExerciseCard } from '@components/exercises/FillInTheBlankExerciseCard'
import { MultipleChoiceTranslationExerciseCard } from '@components/exercises/MultipleChoiceTranslationExerciseCard'
import { SentenceConstructionExerciseCard } from '@components/exercises/SentenceConstructionExerciseCard'
import { FlashcardExerciseCard } from '@components/exercises/FlashcardExerciseCard'
import { GrammarRuleExplanationCard } from '@components/exercises/GrammarRuleExplanationCard'
import { IdentifyTheConceptExerciseCard } from '@components/exercises/IdentifyTheConceptExerciseCard'

import { Colors } from '@constants/Colors'
import { ChevronLeft, Star } from 'lucide-react-native'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'

export default function LessonPlayerScreen(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { lessonDataString, challenge_id, challenge_section_array_index } =
    useLocalSearchParams<{
      lessonDataString?: string
      challenge_id?: string
      challenge_section_array_index?: string
    }>()

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [playerStatus, setPlayerStatus] = useState<
    'loading' | 'playing' | 'completed' | 'error'
  >('loading')
  const [exerciseResults, setExerciseResults] = useState<
    Array<{ exerciseType: string; correct: boolean }>
  >([])

  const isQuizMode =
    lesson?.lesson_title?.toLowerCase().includes('quiz') ||
    !!challenge_id ||
    lesson?.exercises.every(
      ex => ex.exercise_type === 'multiple_choice_translation'
    )

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
            'Player: Parsed lesson invalid or no exercises.',
            parsedLesson
          )
          setPlayerStatus('error')
        }
      } catch (e) {
        console.error('Player: Failed to parse lessonDataString.', e)
        setPlayerStatus('error')
      }
    } else {
      console.error('Player: lessonDataString is missing.')
      setPlayerStatus('error')
    }
  }, [lessonDataString])

  const correctAnswersCount = useMemo(() => {
    return exerciseResults.filter(r => r.correct).length
  }, [exerciseResults])

  const completeLessonAndNotifyChallenge = (
    finalResults: Array<{ exerciseType: string; correct: boolean }>
  ) => {
    if (challenge_id && challenge_section_array_index !== undefined) {
      const sectionIndexNum = parseInt(challenge_section_array_index, 10)
      if (!isNaN(sectionIndexNum)) {
        dispatch(
          markChallengeSectionCompleted({ sectionArrayIndex: sectionIndexNum })
        )
      }
    }
    const correctCount = finalResults.filter(r => r.correct).length
    const totalCount = lesson?.exercises.length || 0
    const scoreMessage =
      totalCount > 0
        ? `You got ${correctCount} out of ${totalCount} correct.`
        : 'Lesson finished.'
    Alert.alert('Lesson Complete!', scoreMessage, [
      {
        text: 'OK',
        onPress: () =>
          router.canGoBack()
            ? router.back()
            : router.replace('/(main)/(tabs)/exercises')
      }
    ])
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

    const { item_id_fk, item_type_fk } = exerciseDetails
    if (item_id_fk && item_type_fk) {
      const outcomePayload: ReviewOutcomePayload = {
        interaction_success: isCorrect,
        review_timestamp_client: new Date().toISOString(),
        review_interaction_type: `lesson_player_${exerciseDetails.exercise_type}`
      }
      const itemForReportingThunk: ReviewItem = {
        item_id: item_id_fk,
        item_type: item_type_fk,
        display_text:
          (exerciseDetails as any).prompt ||
          (exerciseDetails as any).source_phrase ||
          lesson?.lesson_title ||
          'Exercise Item'
      }
      dispatch(
        reportReviewOutcomeThunk({
          item: itemForReportingThunk,
          outcome: outcomePayload
        })
      )
    }

    if (lesson && currentExerciseIndex < lesson.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1)
    } else {
      setPlayerStatus('completed')
      completeLessonAndNotifyChallenge(newResults)
    }
  }

  const PlayerWrapper = isQuizMode ? LinearGradient : View
  const playerWrapperProps = isQuizMode
    ? {
        colors: [
          Colors.light.quizScreenGradientFrom,
          Colors.light.quizScreenGradientTo
        ],
        style: styles.quizGradientBackground
      }
    : { style: styles.container }

  if (playerStatus === 'loading') {
    return (
      <PlayerWrapper {...playerWrapperProps}>
        <SafeAreaView
          style={styles.containerCentered}
          edges={['top', 'bottom']}
        >
          <ActivityIndicator
            size="large"
            color={isQuizMode ? Colors.light.text : Colors.light.primary}
          />
          <Text
            style={isQuizMode ? styles.quizLoadingText : styles.loadingText}
          >
            Loading Lesson...{' '}
          </Text>
        </SafeAreaView>
      </PlayerWrapper>
    )
  }

  if (playerStatus === 'error' || !lesson) {
    return (
      <PlayerWrapper {...playerWrapperProps}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View
            style={[
              styles.customHeader,
              { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
            ]}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBackButtonOnError}
            >
              <ChevronLeft size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.centeredContentMessage}>
            <Text style={styles.errorText}>
              Could not load the lesson. Please try again.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <Text style={styles.actionButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PlayerWrapper>
    )
  }

  if (playerStatus === 'completed') {
    const totalCount = lesson.exercises.length || 0
    const score =
      totalCount > 0 ? Math.round((correctAnswersCount / totalCount) * 100) : 0
    return (
      <PlayerWrapper {...playerWrapperProps}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <Stack.Screen
            options={{ title: 'Lesson Finished', headerShown: false }}
          />
          <View
            style={[
              styles.customHeader,
              { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace(
                      challenge_id
                        ? `/(main)/challenges/daily`
                        : '/(main)/(tabs)/exercises'
                    )
              }
              style={styles.headerBackButtonOnError}
            >
              <ChevronLeft size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lesson Finished!</Text>
            <View style={{ width: 40 }} />
          </View>
          <View style={styles.centeredContentMessage}>
            <Text style={styles.completionTitle}>Nicely Done 🎉</Text>
            <Text style={styles.completionScore}>
              Your score: {score}% ({correctAnswersCount}/{totalCount}){' '}
            </Text>
            <TouchableOpacity
              style={styles.successActionButton}
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
              <Text style={styles.successActionButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </PlayerWrapper>
    )
  }

  const renderExercise = () => {
    const currentExercise = lesson.exercises[currentExerciseIndex]
    if (!currentExercise) return <ActivityIndicator style={{ marginTop: 50 }} />
    const onAnsweredCb = (isCorrect: boolean, userAnswer: string) =>
      handleAnswered(isCorrect, userAnswer, currentExercise)
    const commonProps = {
      exercise: currentExercise,
      onAnswered: onAnsweredCb,
      currentQuestionNumber: currentExerciseIndex + 1,
      totalQuestions: lesson.exercises.length
    }
    switch (currentExercise.exercise_type) {
      case 'flashcard':
        return <FlashcardExerciseCard {...commonProps} />
      case 'fill_in_the_blank':
        return <FillInTheBlankExerciseCard {...commonProps} />
      case 'multiple_choice_translation':
        return <MultipleChoiceTranslationExerciseCard {...commonProps} />
      case 'sentence_construction':
        return <SentenceConstructionExerciseCard {...commonProps} />
      case 'grammar_rule_explanation':
        return <GrammarRuleExplanationCard {...commonProps} />
      case 'identify_the_concept':
        return <IdentifyTheConceptExerciseCard {...commonProps} />
      default:
        return (
          <Text>
            Unsupported exercise: {(currentExercise as any).exercise_type}
          </Text>
        )
    }
  }

  return (
    <PlayerWrapper {...playerWrapperProps}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[
            styles.customHeader,
            { paddingTop: Platform.OS === 'android' ? insets.top : 0 },
            isQuizMode && styles.quizHeaderSpecific
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={
              isQuizMode
                ? styles.quizHeaderBackButton
                : styles.headerBackButtonOnError
            }
          >
            <ChevronLeft
              size={22}
              color={
                isQuizMode ? Colors.light.text : Colors.light.textSecondary
              }
            />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              isQuizMode && styles.quizHeaderTitleSpecific
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {lesson.lesson_title || 'Practice'}
          </Text>
          {lesson.exercises.length > 1 ? (
            <View
              style={[
                styles.scoreContainer,
                isQuizMode && styles.quizScoreContainer
              ]}
            >
              <Star
                size={15}
                color={Colors.light.warning}
                fill={Colors.light.warning}
              />
              <Text style={styles.quizScoreText}>{correctAnswersCount}</Text>
            </View>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {lesson.exercises.length > 1 && (
          <View
            style={[
              styles.progressHeaderContainer,
              isQuizMode && styles.quizProgressHeaderContainer
            ]}
          >
            <View
              style={[
                styles.progressBarTrack,
                isQuizMode && styles.quizProgressBarTrack
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  isQuizMode && styles.quizProgressBarFill,
                  {
                    width: `${
                      lesson.exercises.length > 0
                        ? ((currentExerciseIndex + 1) /
                            lesson.exercises.length) *
                          100
                        : 0
                    }%`
                  }
                ]}
              />
            </View>
            <Text style={styles.standardProgressCountText}>
              {currentExerciseIndex + 1}/{lesson.exercises.length}
            </Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContentContainer,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {playerStatus === 'playing' && renderExercise()}
        </ScrollView>
      </SafeAreaView>
    </PlayerWrapper>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  quizGradientBackground: { flex: 1 },
  containerCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginTop: 10
  },
  quizLoadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.light.text,
    marginTop: 10
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10
  },
  quizHeaderSpecific: {},
  headerBackButtonOnError: {
    padding: 8
  },
  quizHeaderBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.text,
    textAlign: 'center',
    marginHorizontal: 5,
    flexShrink: 1
  },
  quizHeaderTitleSpecific: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.text
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 50,
    justifyContent: 'center'
  },
  quizScoreContainer: {
    backgroundColor: Colors.light.cardBackground,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  quizScoreText: {
    marginLeft: 5,
    fontFamily: 'Inter-Bold',
    fontSize: 14
  },
  progressHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12
  },
  quizProgressHeaderContainer: {
    paddingHorizontal: 24,
    marginVertical: 10
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.common.black + '15'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4
  },
  standardProgressFill: {
    backgroundColor: Colors.light.primary
  },
  quizProgressBarFill: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 3.5
  },
  standardProgressCountText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginLeft: 12
  },
  scrollContentContainer: {
    paddingHorizontal: 20
  },
  centeredContentMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Inter-Medium'
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
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.common.black,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20
  },
  actionButtonText: {
    color: Colors.common.black,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  },
  successActionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20
  },
  successActionButtonText: {
    color: Colors.light.primaryContent,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  }
})
