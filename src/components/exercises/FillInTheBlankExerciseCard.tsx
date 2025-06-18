// src/components/exercises/FillInTheBlankExerciseCard.tsx
import React, { useState, useEffect } from 'react' // Added useEffect
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native'
import { Colors } from '@constants/Colors'
import { Check, X, Lightbulb } from 'lucide-react-native' // Lightbulb for Hint

// Icon for visual aid - could be related to grammar or the sentence context
const fillInBlankVisualAidPlaceholder =
  'https://cdn-icons-png.flaticon.com/512/3259/3259689.png' // Example: book/document icon

export interface FillInTheBlankExercise {
  exercise_type: 'fill_in_the_blank'
  prompt: string // e.g., "Apply grammar: 'adessiivi'" OR "Complete the sentence:"
  sentence_with_blank: string // e.g., "Kissa on _____ (tuoli)." or "Aurinko paistaa ja linnut _____."
  correct_answer: string
  options?: string[] | null
  explanation?: string // Feedback if wrong
  hint?: string // Optional hint for the user
  item_id_fk: string
  item_type_fk: 'word' | 'grammar' | string
}

interface FillInTheBlankExerciseCardProps {
  exercise: FillInTheBlankExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void
}

export const FillInTheBlankExerciseCard: React.FC<
  FillInTheBlankExerciseCardProps
> = ({ exercise, onAnswered }) => {
  const [userAnswer, setUserAnswer] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Calculate isCorrect only when submitted, to avoid premature UI updates
  const [isCorrectOnSubmit, setIsCorrectOnSubmit] = useState<boolean | null>(
    null
  )

  useEffect(() => {
    // Reset state when the exercise changes
    setUserAnswer('')
    setIsSubmitted(false)
    setShowHint(false)
    setIsCorrectOnSubmit(null)
  }, [exercise])

  const isMcqFill = exercise.options && exercise.options.length > 0

  const handleSubmit = () => {
    if (!userAnswer && !isMcqFill) return
    if (isMcqFill && !userAnswer) return

    const correct =
      userAnswer.trim().toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrectOnSubmit(correct) // Set correctness state
    setIsSubmitted(true)
  }

  const handleNext = () => {
    // isCorrectOnSubmit should be set by handleSubmit before this is called
    if (isCorrectOnSubmit === null) return
    onAnswered(isCorrectOnSubmit, userAnswer)
    // State reset is now handled by useEffect on exercise change
  }

  const renderInputMethod = () => {
    if (isMcqFill) {
      return (
        <View style={styles.optionsContainer}>
          {exercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                userAnswer === option && styles.optionSelected,
                isSubmitted &&
                  option === exercise.correct_answer &&
                  styles.optionCorrect,
                isSubmitted &&
                  userAnswer === option &&
                  option !== exercise.correct_answer &&
                  styles.optionIncorrect
              ]}
              onPress={() => {
                if (!isSubmitted) setUserAnswer(option)
              }}
              disabled={isSubmitted}
            >
              <Text style={styles.optionButtonText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    } else {
      return (
        <TextInput
          style={[
            styles.textInputFill,
            isSubmitted &&
              (isCorrectOnSubmit ? styles.inputCorrect : styles.inputIncorrect)
          ]}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Type your answer here"
          placeholderTextColor={Colors.light.textTertiary}
          editable={!isSubmitted}
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
        />
      )
    }
  }

  // Process sentence_with_blank to highlight the blank space more visually
  const formattedSentence = exercise.sentence_with_blank
    .replace(/_____/g, ' __ __ __ __ __ ') // Make underscores more distinct
    .replace(/\(.*\)/g, match => `(${match.slice(1, -1).italics()})`) // Italicize hint in parentheses (conceptual)
  // Actual italicization needs <Text> styling

  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>
        <Text style={styles.instructionText}>{exercise.prompt}</Text>

        <Text style={styles.sentenceToFill}>
          {/* Split sentence to style the blank part if needed, or just display as is */}
          {formattedSentence}
        </Text>

        <View style={styles.visualAidContainer}>
          <Image
            source={{ uri: fillInBlankVisualAidPlaceholder }}
            style={styles.visualAidIcon}
          />
        </View>

        {renderInputMethod()}

        {exercise.hint && !isSubmitted && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => setShowHint(true)}
          >
            <Lightbulb size={16} color={Colors.light.accentOrange} />
            <Text style={styles.hintButtonText}>Show Hint</Text>
          </TouchableOpacity>
        )}
        {showHint && !isSubmitted && exercise.hint && (
          <Text style={styles.hintText}>{exercise.hint}</Text>
        )}
      </View>

      {isSubmitted && (
        <View style={styles.feedbackSection}>
          <View
            style={[
              styles.feedbackBox,
              isCorrectOnSubmit
                ? styles.feedbackBoxCorrect
                : styles.feedbackBoxIncorrect
            ]}
          >
            {isCorrectOnSubmit ? (
              <Check size={18} color={Colors.light.success} />
            ) : (
              <X size={18} color={Colors.light.error} />
            )}
            <Text
              style={[
                styles.feedbackText,
                isCorrectOnSubmit
                  ? { color: Colors.light.success }
                  : { color: Colors.light.error }
              ]}
            >
              {isCorrectOnSubmit
                ? 'Correct!'
                : `Correct answer: ${exercise.correct_answer}`}
            </Text>
          </View>
          {exercise.explanation && !isCorrectOnSubmit && (
            <Text style={styles.explanationText}>{exercise.explanation}</Text>
          )}
        </View>
      )}

      <View style={styles.actionBar}>
        {!isSubmitted ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.submitButton,
              !userAnswer && !isMcqFill && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={(!userAnswer && !isMcqFill) || (isMcqFill && !userAnswer)}
          >
            <Text style={styles.actionButtonText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.actionButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5
    // Mimicking the Pronunciation screen's card feel
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  instructionText: {
    fontSize: 16, // Adjusted size
    fontFamily: 'Inter-SemiBold', // More prominent
    color: Colors.light.textSecondary, // Softer color
    marginBottom: 10, // Spacing
    textAlign: 'center'
  },
  sentenceToFill: {
    fontSize: 22, // Prominent sentence
    fontFamily: 'Inter-Medium', // Not too bold, to let blank stand out
    color: Colors.light.text,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 32,
    paddingHorizontal: 10 // Ensure it doesn't touch edges
  },
  visualAidContainer: {
    width: 60,
    height: 60, // Smaller visual aid
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.7 // Subtler
  },
  visualAidIcon: { width: '100%', height: '100%', resizeMode: 'contain' },

  textInputFill: {
    borderWidth: 1.5, // Slightly thicker border
    borderColor: Colors.light.border, // Use a theme green if active: Colors.light.accentGreen
    backgroundColor: Colors.common.white, // Clean white background
    borderRadius: 12,
    paddingVertical: 16, // Taller input
    paddingHorizontal: 20,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15, // Space before hint/submit
    width: '90%',
    alignSelf: 'center',
    fontFamily: 'Inter-Regular',
    color: Colors.light.text
  },
  inputCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successBackground,
    color: Colors.light.success
  },
  inputIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorBackground,
    color: Colors.light.error
  },

  optionsContainer: { marginBottom: 15, width: '100%' },
  optionButton: {
    backgroundColor: Colors.common.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: 'center'
  },
  // Using accentGreen from your Colors.ts (or a similar theme green)
  optionSelected: {
    borderColor: Colors.light.accentGreen,
    backgroundColor: Colors.light.accentGreen + '20'
  },
  optionCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successBackground
  },
  optionIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorBackground
  },
  optionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.light.text
  },

  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10
  },
  hintButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.light.accentOrange
  },
  hintText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
    marginBottom: 15
  },

  feedbackSection: { marginVertical: 10, paddingHorizontal: 0 }, // No extra horizontal padding
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1
  },
  feedbackBoxCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successBackground
  },
  feedbackBoxIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorBackground
  },
  feedbackText: { marginLeft: 8, fontSize: 15, fontFamily: 'Inter-Medium' },
  explanationText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
    paddingLeft: 30
  },

  actionBar: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  actionButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  // Using accentGreen for "Check" and a different color for "Next" to match pronunciation screen buttons
  submitButton: { backgroundColor: Colors.light.accentGreen },
  nextButton: { backgroundColor: Colors.light.primary },
  buttonDisabled: { backgroundColor: Colors.light.border, opacity: 0.7 },
  actionButtonText: {
    color: Colors.common.white,
    fontFamily: 'Inter-Bold',
    fontSize: 16
  }
})
