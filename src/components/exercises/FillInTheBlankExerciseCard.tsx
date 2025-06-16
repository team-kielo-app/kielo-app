// src/components/exercises/FillInTheBlankExerciseCard.tsx
import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from 'react-native'
import { Colors } from '@constants/Colors'
import { Check, X } from 'lucide-react-native' // Assuming lucide-react-native is used

// Define a type for the exercise data this card expects
export interface FillInTheBlankExercise {
  exercise_type: 'fill_in_the_blank'
  prompt: string // e.g., "Minulla on kaksi ____ (auto)."
  // sentence_with_blank could be derived or provided: "Minulla on kaksi ____."
  correct_answer: string
  options?: string[] // If present, it's a multiple-choice fill-in-the-blank
  // item_id_fk?: string; // Optional: ID of the word/grammar concept being tested
  // item_type_fk?: string; // Optional: "word" or "grammar"
  explanation?: string // Optional: Explanation if the answer is wrong
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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  const isMcqFill = exercise.options && exercise.options.length > 0

  const handleSubmit = () => {
    if (!userAnswer && !isMcqFill) return // Require input for text entry
    if (isMcqFill && !userAnswer) return // Require selection for MCQ

    const correct =
      userAnswer.trim().toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setIsSubmitted(true)
    // onAnswered(correct, userAnswer); // Call this after user clicks "Next" or if auto-advancing
  }

  const handleNext = () => {
    if (isCorrect === null) return // Should not happen if submit was pressed
    onAnswered(isCorrect, userAnswer)
    // Reset state for potential reuse if this component isn't unmounted
    setUserAnswer('')
    setIsSubmitted(false)
    setIsCorrect(null)
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
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )
    } else {
      return (
        <TextInput
          style={[
            styles.input,
            isSubmitted &&
              (isCorrect ? styles.inputCorrect : styles.inputIncorrect)
          ]}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder="Your answer"
          editable={!isSubmitted}
          onSubmitEditing={handleSubmit}
          autoCapitalize="none"
        />
      )
    }
  }

  // Attempt to display the prompt with a clear blank
  const displayPrompt = exercise.prompt
    .replace(/____\(.+\)/g, '______')
    .replace(/____/g, '______')

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{displayPrompt}</Text>
      <Text style={styles.sentenceForBlank}>
        {exercise.sentence_with_blank}
      </Text>

      {renderInputMethod()}

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
              : `Correct answer: ${exercise.correct_answer}`}
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
              !userAnswer && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!userAnswer}
          >
            <Text style={styles.buttonText}>Submit</Text>
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
  mainPrompt: {
    // For the overall instruction from KLearn
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  sentenceForBlank: {
    // For the sentence containing the blank
    fontSize: 19, // Make it slightly larger
    color: Colors.light.text,
    marginBottom: 20,
    lineHeight: 28, // Ensure good readability
    textAlign: 'center',
    fontWeight: '500'
  },
  prompt: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 20,
    lineHeight: 26,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: Colors.light.white
  },
  inputCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successLight
  },
  inputIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorLight
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
    fontSize: 16,
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
