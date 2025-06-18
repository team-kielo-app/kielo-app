import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, useRouter, useLocalSearchParams } from 'expo-router'
import {
  ChevronLeft,
  X as IconX,
  AlertCircle as IconMedium,
  CheckCircle as IconEasy
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { AppDispatch } from '@store/store'
import {
  fetchReviewsThunk,
  reportReviewOutcomeThunk,
  advanceReviewItem,
  clearReviews,
  selectCurrentReviewItem,
  selectReviewStatus,
  selectReviewError,
  selectIsReviewSessionActive,
  selectCurrentReviewItemIndex,
  selectAllReviewItems
} from '@features/reviews/reviewsSlice'
import { ReviewOutcomePayload } from '@features/reviews/types'
import { WordReviewCard } from '@components/reviews/WordReviewCard'
import { GrammarReviewCard } from '@components/reviews/GrammarReviewCard'
import { Colors } from '@constants/Colors'
import { LearningTipCard } from '@/components/common/LearningTipCard'
import { markChallengeSectionCompleted } from '@/features/challenges/challengesSlice'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ReviewSessionScreen(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const { challenge_id, challenge_section_array_index } = useLocalSearchParams<{
    challenge_id?: string
    challenge_section_array_index?: string
  }>()

  const currentItem = useSelector(selectCurrentReviewItem)
  const status = useSelector(selectReviewStatus)
  const error = useSelector(selectReviewError)
  const isSessionActive = useSelector(selectIsReviewSessionActive)
  const currentIndex = useSelector(selectCurrentReviewItemIndex)
  const totalItems = useSelector(selectAllReviewItems).length

  const [isCardFlipped, setIsCardFlipped] = useState(false)

  useEffect(() => {
    if (!isSessionActive && status === 'idle') {
      dispatch(fetchReviewsThunk({ limit: challenge_id ? 5 : 20 }))
    }
  }, [dispatch, isSessionActive, status, challenge_id])

  useEffect(() => {
    setIsCardFlipped(false)
  }, [currentItem])

  const handleAssessment = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (currentItem) {
      let success = false
      if (difficulty === 'easy' || difficulty === 'medium') success = true

      const outcome: ReviewOutcomePayload = {
        interaction_success: success,
        review_timestamp_client: new Date().toISOString(),
        review_interaction_type: `nsr_${currentItem.item_type}_flashcard_assess_${difficulty}`
      }
      dispatch(reportReviewOutcomeThunk({ item: currentItem, outcome }))
    }
    dispatch(advanceReviewItem())
  }

  const handleGoBack = () => {
    if (
      isSessionActive &&
      totalItems > 0 &&
      currentIndex < totalItems &&
      currentIndex !== -1
    ) {
      Alert.alert(
        'End Review Session?',
        'Your progress in this session will not be saved if you go back now.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'End Session',
            style: 'destructive',
            onPress: () => {
              dispatch(clearReviews())
              router.canGoBack()
                ? router.back()
                : router.replace(
                    challenge_id
                      ? `/(main)/challenges/daily`
                      : '/(main)/(tabs)/exercises'
                  )
            }
          }
        ]
      )
    } else {
      dispatch(clearReviews())
      router.canGoBack()
        ? router.back()
        : router.replace(
            challenge_id
              ? `/(main)/challenges/daily`
              : '/(main)/(tabs)/exercises'
          )
    }
  }

  useEffect(() => {
    if (
      status === 'succeeded' &&
      !isSessionActive &&
      totalItems > 0 &&
      currentIndex === -1
    ) {
      if (challenge_id && challenge_section_array_index !== undefined) {
        const sectionIndexNum = parseInt(challenge_section_array_index, 10)
        if (!isNaN(sectionIndexNum)) {
          dispatch(
            markChallengeSectionCompleted({
              sectionArrayIndex: sectionIndexNum
            })
          )
        }
      }
    }
  }, [
    status,
    isSessionActive,
    totalItems,
    currentIndex,
    challenge_id,
    challenge_section_array_index,
    dispatch
  ])

  if (status === 'loading' && !isSessionActive) {
    return (
      <LinearGradient
        colors={[
          Colors.light.flashcardGradientFrom,
          Colors.light.flashcardGradientTo
        ]}
        style={styles.gradientBackgroundFull}
      >
        <SafeAreaView
          style={styles.containerCentered}
          edges={['top', 'bottom']}
        >
          <ActivityIndicator size="large" color={Colors.light.text} />
          <Text style={styles.loadingText}>Loading Flashcards...</Text>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const progressPercentage =
    totalItems > 0 ? ((currentIndex + 1) / totalItems) * 100 : 0

  if (!isSessionActive && status !== 'loading') {
    const title = status === 'failed' ? 'Error' : 'Review Complete'
    const message =
      status === 'failed'
        ? error || 'Could not load flashcards.'
        : totalItems > 0
        ? "You've reviewed all flashcards!"
        : 'No flashcards due for review right now.'

    return (
      <LinearGradient
        colors={[
          Colors.light.flashcardGradientFrom,
          Colors.light.flashcardGradientTo
        ]}
        style={styles.gradientBackgroundFull}
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
              <ChevronLeft size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>{title}</Text>
            <View style={{ width: 30 }} />
          </View>
          <View style={styles.centeredContentMessage}>
            <Text
              style={
                status === 'failed'
                  ? styles.errorMessageText
                  : styles.completionMessageTitle
              }
            >
              {message}
            </Text>
            {status === 'failed' && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => dispatch(fetchReviewsThunk({ limit: 20 }))}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
            {status !== 'failed' && (
              <TouchableOpacity
                style={styles.backToHubButton}
                onPress={handleGoBack}
              >
                <Text style={styles.backToHubButtonText}>Back to Hub</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  const learningTipExample =
    currentItem?.item_type === 'word'
      ? currentItem.word_examples?.[0]?.sentence_fi ||
        'Try using this in a sentence today!'
      : currentItem?.grammar_examples?.[0]?.sentence_fi ||
        'Think of a sentence using this rule.'

  return (
    <LinearGradient
      colors={[
        Colors.light.flashcardGradientFrom,
        Colors.light.flashcardGradientTo
      ]}
      style={styles.gradientBackgroundFull}
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
            <ChevronLeft size={22} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>
            {challenge_id ? 'Challenge Review' : 'Daily Flashcards'}
          </Text>
          <Text style={styles.headerProgressText}>
            {totalItems > 0 ? `${currentIndex + 1}/${totalItems}` : '0/0'}
          </Text>
        </View>

        <View style={styles.progressBarOuterContainer}>
          <View
            style={[
              styles.progressBarInner,
              { width: `${progressPercentage}%` }
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.flashcardDisplayArea}>
            {currentItem && currentItem.item_type === 'word' && (
              <WordReviewCard
                item={currentItem}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />
            )}
            {currentItem && currentItem.item_type === 'grammar' && (
              <GrammarReviewCard
                item={currentItem}
                isFlipped={isCardFlipped}
                onFlip={() => setIsCardFlipped(!isCardFlipped)}
              />
            )}
            {!currentItem && isSessionActive && (
              <ActivityIndicator
                style={{ marginTop: 50 }}
                color={Colors.light.primary}
              />
            )}
          </View>

          {currentItem && (
            <>
              <View style={styles.ratingButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    { backgroundColor: Colors.light.flashcardButtonHardBg }
                  ]}
                  onPress={() => handleAssessment('hard')}
                >
                  <IconX size={20} color={Colors.light.error} />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: Colors.light.error }
                    ]}
                  >
                    Hard
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    { backgroundColor: Colors.light.flashcardButtonMediumBg }
                  ]}
                  onPress={() => handleAssessment('medium')}
                >
                  <IconMedium size={20} color={Colors.light.warning} />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: Colors.light.warning }
                    ]}
                  >
                    Medium
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.ratingButton,
                    { backgroundColor: Colors.light.flashcardButtonEasyBg }
                  ]}
                  onPress={() => handleAssessment('easy')}
                >
                  <IconEasy size={20} color={Colors.light.success} />
                  <Text
                    style={[
                      styles.ratingButtonText,
                      { color: Colors.light.success }
                    ]}
                  >
                    Easy
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.learningTipContainer}>
                <LearningTipCard
                  tipDescription={learningTipExample}
                  iconType="mascot"
                />
              </View>
            </>
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
    alignItems: 'center',
    padding: 20
  },
  centeredContentMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 10
  },
  headerTitleText: {
    flex: 1,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: Colors.light.flashcardTermText
  },
  headerProgressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 15,
    color: Colors.light.flashcardTermText,
    minWidth: 40,
    textAlign: 'right'
  },
  progressBarOuterContainer: {
    height: 8,
    backgroundColor: Colors.common.black + '15',
    borderRadius: 4,
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 14
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.light.flashcardProgressBarFill,
    borderRadius: 4
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  flashcardDisplayArea: {
    width: '100%',
    aspectRatio: 1 / 1,
    maxHeight: 380,
    marginBottom: 24,
    alignSelf: 'center'
  },
  ratingButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    shadowColor: Colors.light.shadowSubtle,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1
  },
  ratingButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginTop: 4
  },
  learningTipContainer: {
    marginBottom: Platform.OS === 'ios' ? 10 : 60
  },
  completionMessageTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12
  },
  errorMessageText: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25
  },
  retryButtonText: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15
  },
  backToHubButton: {
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25
  },
  backToHubButtonText: {
    color: Colors.light.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15
  }
})
