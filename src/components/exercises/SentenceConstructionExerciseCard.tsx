// src/components/exercises/SentenceConstructionExerciseCard.tsx
import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { Colors } from '@constants/Colors'
import { Shuffle, RotateCw, ThumbsUp, Check, X } from 'lucide-react-native' // Assuming lucide-react-native

// Define a type for the exercise data this card expects
export interface SentenceConstructionExerciseCardExercise {
  exercise_type: 'sentence_builder'
  // KLearn should provide the target sentence and its translation.
  // Scrambled words can be derived by Kielo Backend or Frontend.
  target_sentence_fi: string
  translation_en: string
  grammar_focus?: string // Optional: e.g., "Partitive Plural"
  // item_id_fk?: string; // Optional: ID of the main grammar concept or word being tested
  // item_type_fk?: string; // Optional: "word" or "grammar"
}

interface SentenceConstructionExerciseCardCardProps {
  exercise: SentenceConstructionExerciseCardExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void // userAnswer is the built sentence
}

export const SentenceConstructionExerciseCard: React.FC<
  SentenceConstructionExerciseCardCardProps
> = ({ exercise, onAnswered }) => {
  const originalWords = useMemo(
    () => exercise.target_sentence_fi.split(' '),
    [exercise.target_sentence_fi]
  )

  const [scrambledWords, setScrambledWords] = useState<string[]>([])
  const [userAnswerWords, setUserAnswerWords] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  useEffect(() => {
    // Shuffle words when the exercise changes or on initial load
    setScrambledWords([...originalWords].sort(() => Math.random() - 0.5))
    setUserAnswerWords([])
    setIsSubmitted(false)
    setIsCorrect(null)
  }, [exercise, originalWords])

  const handleWordSelect = (word: string, index: number) => {
    if (isSubmitted) return
    const newScrambled = [...scrambledWords]
    newScrambled.splice(index, 1)
    setScrambledWords(newScrambled)
    setUserAnswerWords([...userAnswerWords, word])
  }

  const handleWordRemove = (word: string, index: number) => {
    if (isSubmitted) return
    const newUserAnswer = [...userAnswerWords]
    newUserAnswer.splice(index, 1)
    setUserAnswerWords(newUserAnswer)
    setScrambledWords([...scrambledWords, word].sort(() => Math.random() - 0.5)) // Add back and re-scramble remaining
  }

  const handleSubmit = () => {
    if (userAnswerWords.length === 0) return
    const correct = userAnswerWords.join(' ') === exercise.target_sentence_fi
    setIsCorrect(correct)
    setIsSubmitted(true)
    // onAnswered will be called on "Next"
  }

  const handleNext = () => {
    if (isCorrect === null) return
    onAnswered(isCorrect, userAnswerWords.join(' '))
    // State reset is handled by useEffect when `exercise` prop changes for a new exercise
  }

  const handleReset = () => {
    setUserAnswerWords([])
    setScrambledWords([...originalWords].sort(() => Math.random() - 0.5))
    setIsSubmitted(false)
    setIsCorrect(null)
  }

  return (
    <View style={styles.card}>
      <ScrollView>
        <Text style={styles.instruction}>
          Unscramble the words to form a correct Finnish sentence.
        </Text>
        <Text style={styles.translationHint}>"{exercise.translation_en}"</Text>
        {exercise.grammar_focus && (
          <Text style={styles.grammarFocus}>
            Focus: {exercise.grammar_focus}
          </Text>
        )}

        <View style={styles.answerArea}>
          {userAnswerWords.length === 0 && !isSubmitted ? (
            <Text style={styles.placeholderText}>Tap words below</Text>
          ) : (
            userAnswerWords.map((word, index) => (
              <TouchableOpacity
                key={`ans-${index}`}
                style={styles.wordChipAnswer}
                onPress={() => handleWordRemove(word, index)}
                disabled={isSubmitted}
              >
                <Text style={styles.chipText}>{word}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.wordBank}>
          {scrambledWords.map((word, index) => (
            <TouchableOpacity
              key={`bank-${index}`}
              style={styles.wordChipBank}
              onPress={() => handleWordSelect(word, index)}
              disabled={isSubmitted}
            >
              <Text style={styles.chipText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isSubmitted && (
          <View
            style={[
              styles.feedbackContainer,
              isCorrect ? styles.feedbackCorrectBg : styles.feedbackIncorrectBg
            ]}
          >
            {isCorrect ? (
              <ThumbsUp size={20} color={Colors.light.success} />
            ) : (
              <X size={20} color={Colors.light.error} />
            )}
            <Text
              style={[
                styles.feedbackText,
                isCorrect
                  ? { color: Colors.light.success }
                  : { color: Colors.light.error }
              ]}
            >
              {isCorrect
                ? 'Excellent!'
                : `Correct sentence: ${exercise.target_sentence_fi}`}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {!isSubmitted ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleReset}
              disabled={userAnswerWords.length === 0}
            >
              <RotateCw size={18} color={Colors.light.textSecondary} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                userAnswerWords.length !== originalWords.length &&
                  styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={userAnswerWords.length !== originalWords.length}
            >
              <Text style={styles.buttonText}>Check</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// Styles for SentenceConstructionExerciseCard (can be adjusted)
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 350, // Give it some space
    justifyContent: 'space-between' // Push actions to bottom
  },
  instruction: {
    fontSize: 17,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  translationHint: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  grammarFocus: {
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500'
  },
  answerArea: {
    minHeight: 60,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center', // Vertically center placeholder
    justifyContent: 'center' // Horizontally center placeholder or items
  },
  placeholderText: {
    color: Colors.light.textTertiary,
    fontSize: 15
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8, // For spacing between chips
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border
  },
  wordChipAnswer: {
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    margin: 4 // Add margin for spacing if gap not supported well
  },
  wordChipBank: {
    backgroundColor: Colors.light.backgroundLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  chipText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500'
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10
  },
  feedbackCorrectBg: { backgroundColor: Colors.light.successLight },
  feedbackIncorrectBg: { backgroundColor: Colors.light.errorLight },
  feedbackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100
  },
  secondaryButton: {
    backgroundColor: Colors.light.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  secondaryButtonText: {
    color: Colors.light.textSecondary,
    marginLeft: 6
  },
  submitButton: {
    backgroundColor: Colors.light.primary
  },
  nextButton: {
    backgroundColor: Colors.light.accent,
    flex: 1 // Make "Next" take full width if it's the only one
  },
  buttonDisabled: {
    backgroundColor: Colors.light.border,
    opacity: 0.7
  },
  buttonText: {
    color: Colors.light.white,
    fontWeight: 'bold',
    fontSize: 16
  }
})
