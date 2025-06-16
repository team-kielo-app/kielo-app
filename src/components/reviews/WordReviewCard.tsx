// src/components/reviews/WordReviewCard.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { Volume2 } from 'lucide-react-native' // For pronunciation
import { ReviewItem, ReviewOutcomePayload } from '@features/reviews/types'
import { Colors } from '@constants/Colors'

interface WordReviewCardProps {
  item: ReviewItem
  onReviewed: (outcome: ReviewOutcomePayload) => void
}

export const WordReviewCard: React.FC<WordReviewCardProps> = ({
  item,
  onReviewed
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showExample, setShowExample] = useState(false)

  // Reset flip state when item changes
  useEffect(() => {
    setIsFlipped(false)
    setShowExample(false)
  }, [item])

  const handleOutcome = (success: boolean) => {
    onReviewed({
      interaction_success: success,
      review_timestamp_client: new Date().toISOString(),
      review_interaction_type: 'nsr_word_flashcard_self_assess' // Specific type for NSR word review
    })
    // State reset (isFlipped, showExample) handled by useEffect on item change
  }

  const playPronunciation = () => {
    // TODO: Implement actual audio playback using item.pronunciation_ipa or a dedicated audio URL if available
    if (item.pronunciation_ipa) {
      Alert.alert(
        'Pronunciation',
        `Simulating play for: ${item.pronunciation_ipa}`
      )
    } else {
      Alert.alert('Pronunciation', 'No IPA available.')
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.flipContainer}
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.8}
      >
        {!isFlipped ? (
          <View style={styles.front}>
            <Text style={styles.displayText}>{item.display_text}</Text>
            {item.part_of_speech && (
              <Text style={styles.posText}>({item.part_of_speech})</Text>
            )}
            <Text style={styles.tapToRevealText}>(Tap to reveal meaning)</Text>
          </View>
        ) : (
          <View style={styles.back}>
            <Text style={styles.translationText}>
              {item.primary_translation_en || 'N/A'}
            </Text>

            {item.pronunciation_ipa && (
              <TouchableOpacity
                style={styles.pronunciationContainer}
                onPress={playPronunciation}
              >
                <Volume2 size={18} color={Colors.light.primary} />
                <Text style={styles.ipaText}>{item.pronunciation_ipa}</Text>
              </TouchableOpacity>
            )}

            {item.cefr_level && (
              <Text style={styles.detailLabel}>
                CEFR: <Text style={styles.detailValue}>{item.cefr_level}</Text>
              </Text>
            )}

            {item.example_sentence_fi && (
              <TouchableOpacity
                onPress={() => setShowExample(!showExample)}
                style={styles.exampleToggle}
              >
                <Text style={styles.exampleToggleText}>
                  {showExample ? 'Hide' : 'Show'} Example
                </Text>
              </TouchableOpacity>
            )}
            {showExample && item.example_sentence_fi && (
              <Text style={styles.exampleSentenceText}>
                "{item.example_sentence_fi}"
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonBad]}
            onPress={() => handleOutcome(false)}
          >
            <Text style={styles.buttonText}>Didn't Know</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonGood]}
            onPress={() => handleOutcome(true)}
          >
            <Text style={styles.buttonText}>Knew It!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

// Add Alert import for placeholder pronunciation
import { Alert } from 'react-native'

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16, // Slightly more rounded
    padding: 25,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    minHeight: 300, // Good height for flashcards
    justifyContent: 'space-between'
  },
  flipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10
  },
  front: { alignItems: 'center' },
  back: {
    alignItems: 'center', // Center back content too
    width: '100%' // Ensure back content takes full width for alignment
  },
  displayText: {
    fontSize: 36, // Larger for the main word
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  posText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 15
  },
  tapToRevealText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary,
    marginTop: 10
  },
  translationText: {
    fontSize: 28, // Prominent translation
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 15
  },
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12
  },
  ipaText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginLeft: 8
  },
  detailLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 3
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.text
  },
  exampleToggle: {
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 5
  },
  exampleToggleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.accent
  },
  exampleSentenceText: {
    fontSize: 15,
    fontFamily: 'Inter-RegularItalic', // Assuming you have italic font
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 10
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20, // Ensure good tap area
    borderRadius: 25, // Pill shape
    minWidth: 140, // Make buttons wider
    alignItems: 'center',
    shadowColor: '#000', // Add subtle shadow to buttons
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2
  },
  buttonGood: { backgroundColor: Colors.light.success },
  buttonBad: { backgroundColor: Colors.light.error },
  buttonText: {
    color: Colors.light.white,
    fontFamily: 'Inter-Bold',
    fontSize: 16
  }
})
