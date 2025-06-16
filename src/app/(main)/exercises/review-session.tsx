// src/app/(main)/reviews/session.tsx (or a similar path, adjust _layout.tsx if needed)
import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchReviewsThunk,
  reportReviewOutcomeThunk,
  advanceReviewItem,
  clearReviews,
  selectCurrentReviewItem,
  selectReviewStatus,
  selectReviewError,
  selectNextBatchAvailableAt,
  selectIsReviewSessionActive,
  selectCurrentReviewItemIndex,
  selectAllReviewItems
} from '@features/reviews/reviewsSlice'
import { ReviewOutcomePayload } from '@features/reviews/types'
import { WordReviewCard } from '@components/reviews/WordReviewCard'
import { GrammarReviewCard } from '@components/reviews/GrammarReviewCard'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@/components/common/ScreenHeader' // Assuming this exists
import { markChallengeSectionCompleted } from '@/features/challenges/challengesSlice'

export default function ReviewSessionScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  // Get challenge context if this review session is part of a challenge
  const { challenge_id, challenge_section_array_index } = useLocalSearchParams<{
    challenge_id?: string
    challenge_section_array_index?: string
  }>()

  const currentItem = useSelector(selectCurrentReviewItem)
  const status = useSelector(selectReviewStatus)
  const error = useSelector(selectReviewError)
  const nextBatchTime = useSelector(selectNextBatchAvailableAt)
  const isSessionActive = useSelector(selectIsReviewSessionActive)
  const currentIndex = useSelector(selectCurrentReviewItemIndex)
  const totalItems = useSelector(selectAllReviewItems).length

  useEffect(() => {
    // Fetch reviews when the component mounts if no session is active and not loading/failed
    if (!isSessionActive && status === 'idle') {
      dispatch(fetchReviewsThunk({ limit: 10 })) // Fetch 10 items for the session
    }

    // Optional: Clear reviews when the screen is unmounted,
    // or provide a button to "End Session" which dispatches clearReviews.
    return () => {
      // Consider if you want to clear reviews on unmount or let user resume
      // dispatch(clearReviews()); // This would clear progress if user navigates away mid-session
    }
  }, [dispatch, isSessionActive, status])

  const handleReviewed = (outcome: ReviewOutcomePayload) => {
    if (currentItem) {
      dispatch(reportReviewOutcomeThunk({ item: currentItem, outcome }))
    }
    dispatch(advanceReviewItem()) // This action comes from reviewsSlice
  }

  const completeNSRAndNotifyChallenge = () => {
    // Called when all items in this NSR session are done *and* it's part of a challenge
    if (challenge_id && challenge_section_array_index !== undefined) {
      const sectionIndexNum = parseInt(challenge_section_array_index, 10)
      if (!isNaN(sectionIndexNum)) {
        console.log(
          `NSR Review section (challenge ${challenge_id}, index ${sectionIndexNum}) completed.`
        )
        // +++ Use the imported action creator directly +++
        dispatch(
          markChallengeSectionCompleted({ sectionArrayIndex: sectionIndexNum })
        )
      }
    }
    // Navigate back or show completion message for the review session itself
    // This part is handled by the `!isSessionActive && status === 'succeeded'` block below
  }

  const handleEndSession = () => {
    dispatch(clearReviews())
    router.replace('/(main)/(tabs)/') // Go back to home or dashboard
  }

  if (status === 'loading' && !isSessionActive) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.infoText}>Loading reviews...</Text>
      </SafeAreaView>
    )
  }

  if (error && !isSessionActive) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(fetchReviewsThunk({ limit: 10 }))}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!isSessionActive && status === 'succeeded') {
    // If this session was part of a challenge, mark it as completed
    if (
      challenge_id &&
      challenge_section_array_index !== undefined &&
      totalItems > 0
    ) {
      // only if items were reviewed
      completeNSRAndNotifyChallenge()
    }

    return (
      <SafeAreaView style={styles.containerCentered}>
        <Stack.Screen options={{ title: 'Review Complete' }} />
        {/* Changed fallbackPath if part of challenge */}
        <ScreenHeader
          title="Review Complete"
          fallbackPath={
            challenge_id ? `/(main)/challenges/daily` : '/(main)/(tabs)/'
          }
        />
        <Text style={styles.title}>All Done for Now!</Text>
        <Text style={styles.infoText}>
          {totalItems > 0
            ? "You've completed all reviews in this session."
            : 'No reviews due at the moment.'}
        </Text>
        {nextBatchTime && (
          <Text style={styles.infoText}>
            Next batch might be available around:{' '}
            {new Date(nextBatchTime).toLocaleTimeString()}
          </Text>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEndSession}
        >
          <Text style={styles.actionButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{ title: `Review (${currentIndex + 1}/${totalItems})` }}
      />
      <ScreenHeader
        title={`Review (${currentIndex + 1}/${totalItems})`}
        fallbackPath="/(main)/(tabs)/"
      />

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        {currentItem && currentItem.item_type === 'word' && (
          <WordReviewCard item={currentItem} onReviewed={handleReviewed} />
        )}
        {currentItem && currentItem.item_type === 'grammar' && (
          <GrammarReviewCard item={currentItem} onReviewed={handleReviewed} />
        )}
        {!currentItem && isSessionActive && (
          // Should not happen if logic is correct, but a fallback
          <Text style={styles.infoText}>Loading next item...</Text>
        )}
      </ScrollView>

      {/* Progress Bar and Controls (Optional) */}
      <View style={styles.footerControls}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${
                  ((currentIndex + 1) / Math.max(1, totalItems)) * 100
                }%`
              }
            ]}
          />
        </View>
        <TouchableOpacity
          style={styles.endSessionButton}
          onPress={handleEndSession}
        >
          <Text style={styles.endSessionButtonText}>End Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

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
    padding: 20,
    paddingBottom: 80 // Space for footer controls
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 15,
    textAlign: 'center'
  },
  infoText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 15
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
    fontWeight: '500'
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
    fontWeight: 'bold'
  },
  footerControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.light.background, // Or cardBackground for slight elevation
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 15
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4
  },
  endSessionButton: {
    backgroundColor: Colors.light.errorLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  endSessionButtonText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: 'bold'
  }
})
