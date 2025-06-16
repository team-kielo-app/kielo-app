// src/components/exercises/IdentifyTheConceptExerciseCard.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '@constants/Colors'
import {
  KLearnIdentifyTheConceptExercise,
  KLearnExerciseOption
} from '@features/lessons/types'
import { Check, X } from 'lucide-react-native'

interface IdentifyTheConceptCardProps {
  exercise: KLearnIdentifyTheConceptExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void // userAnswer is the ID of selected concept
}

export const IdentifyTheConceptExerciseCard: React.FC<
  IdentifyTheConceptCardProps
> = ({ exercise, onAnswered }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const isCorrect = selectedOptionId === exercise.correct_concept_id

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return
    setSelectedOptionId(optionId)
  }

  const handleSubmit = () => {
    if (!selectedOptionId) return
    setIsSubmitted(true)
  }

  const handleNext = () => {
    onAnswered(isCorrect, selectedOptionId || '')
    setSelectedOptionId(null)
    setIsSubmitted(false)
  }

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>{exercise.prompt}</Text>
      <View style={styles.sentenceBox}>
        <Text style={styles.sentenceFi}>{exercise.sentence_fi}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {exercise.options.map(option => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionButton,
              selectedOptionId === option.id && styles.optionSelected,
              isSubmitted &&
                option.id === exercise.correct_concept_id &&
                styles.optionCorrect,
              isSubmitted &&
                selectedOptionId === option.id &&
                option.id !== exercise.correct_concept_id &&
                styles.optionIncorrect
            ]}
            onPress={() => handleSelectOption(option.id)}
            disabled={isSubmitted}
          >
            <Text style={styles.optionText}>{option.text}</Text>
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
              isCorrect
                ? styles.feedbackCorrectText
                : styles.feedbackIncorrectText
            ]}
          >
            {isCorrect
              ? 'Correct!'
              : `Correct concept: ${
                  exercise.options.find(
                    o => o.id === exercise.correct_concept_id
                  )?.text || 'N/A'
                }`}
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
              !selectedOptionId && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedOptionId}
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
  prompt: {
    fontSize: 17,
    color: Colors.light.textSecondary,
    marginBottom: 10,
    textAlign: 'center'
  },
  sentenceBox: {
    backgroundColor: Colors.light.backgroundLight,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  sentenceFi: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 26
  },
  optionsContainer: { marginBottom: 20 },
  optionButton: {
    backgroundColor: Colors.light.white,
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
  feedbackText: { marginLeft: 8, fontSize: 16, fontWeight: '500' },
  feedbackCorrectText: { color: Colors.light.success },
  feedbackIncorrectText: { color: Colors.light.error },
  explanationText: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 28
  },
  actions: { marginTop: 10 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  submitButton: { backgroundColor: Colors.light.primary },
  nextButton: { backgroundColor: Colors.light.accent },
  buttonDisabled: { backgroundColor: Colors.light.border },
  buttonText: { color: Colors.light.white, fontWeight: 'bold', fontSize: 16 }
})
