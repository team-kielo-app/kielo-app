// src/components/exercises/MultipleChoiceTranslationExerciseCard.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '@constants/Colors'
import { Check, X } from 'lucide-react-native'

export interface MultipleChoiceTranslationExercise {
  exercise_type: 'multiple_choice_translation'
  prompt: string // e.g., "Translate: 'three apples'"
  source_phrase: string // e.g., "three apples"
  // source_language: string; // e.g., "en"
  // target_language: string; // e.g., "fi"
  correct_translation: string
  distractor_translations: string[]
  explanation?: string // Optional
}

interface MCTranslationCardProps {
  exercise: MultipleChoiceTranslationExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void
}

export const MultipleChoiceTranslationExerciseCard: React.FC<
  MCTranslationCardProps
> = ({ exercise, onAnswered }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isCorrect = selectedAnswer === exercise.correct_translation

  const options = React.useMemo(() => {
    const allOptions = [
      exercise.correct_translation,
      ...exercise.distractor_translations
    ]
    // Simple shuffle, for more robust shuffling, use a library or Fisher-Yates
    return allOptions.sort(() => Math.random() - 0.5)
  }, [exercise.correct_translation, exercise.distractor_translations])

  const handleSelectOption = (option: string) => {
    if (isSubmitted) return
    setSelectedAnswer(option)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) return
    setIsSubmitted(true)
    // onAnswered(isCorrect, selectedAnswer); // Call this after user clicks "Next"
  }

  const handleNext = () => {
    onAnswered(isCorrect, selectedAnswer || '') // Pass empty string if somehow no answer was selected
    // Reset state
    setSelectedAnswer(null)
    setIsSubmitted(false)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{exercise.prompt}</Text>
      <Text style={styles.sourcePhrase}>"{exercise.source_phrase}"</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && styles.optionSelected,
              isSubmitted &&
                option === exercise.correct_translation &&
                styles.optionCorrect,
              isSubmitted &&
                selectedAnswer === option &&
                option !== exercise.correct_translation &&
                styles.optionIncorrect
            ]}
            onPress={() => handleSelectOption(option)}
            disabled={isSubmitted}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isSubmitted && (
        <View style={styles.feedbackContainer}>
          {isCorrect ? (
            <Check size={20} color={Colors.light.success} />
          ) : (
            <X size={20} color={Colors.light.error} />
          )}
          <Text
            style={[
              styles.feedbackText,
              isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect
            ]}
          >
            {isCorrect
              ? 'Correct!'
              : `The right answer is: ${exercise.correct_translation}`}
          </Text>
          {exercise.explanation && !isCorrect && (
            <Text style={styles.explanationText}>{exercise.explanation}</Text>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {!isSubmitted ? (
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              !selectedAnswer && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedAnswer}
          >
            <Text style={styles.buttonText}>Check Answer</Text>
          </TouchableOpacity>
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

// Styles are similar to FillInTheBlankExerciseCard, with minor adjustments
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
    elevation: 2
  },
  prompt: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textAlign: 'center'
  },
  sourcePhrase: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 25,
    textAlign: 'center'
  },
  optionsContainer: {
    marginBottom: 20
  },
  optionButton: {
    backgroundColor: Colors.light.backgroundLight,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center'
  },
  optionSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight
  },
  optionCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successLight
  },
  optionIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorLight
  },
  optionText: {
    fontSize: 17,
    color: Colors.light.text
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500'
  },
  feedbackCorrect: { color: Colors.light.success },
  feedbackIncorrect: { color: Colors.light.error },
  explanationText: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 28 // Align with feedback text
  },
  actions: {
    marginTop: 10
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButton: {
    backgroundColor: Colors.light.primary
  },
  nextButton: {
    backgroundColor: Colors.light.accent
  },
  buttonDisabled: {
    backgroundColor: Colors.light.border
  },
  buttonText: {
    color: Colors.light.white,
    fontWeight: 'bold',
    fontSize: 16
  }
})
