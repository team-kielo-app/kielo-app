// src/components/reviews/GrammarReviewCard.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import {
  ReviewItem,
  ReviewOutcomePayload,
  ReviewItemExerciseSnippet
} from '@features/reviews/types'
import { Colors } from '@constants/Colors'
import { Check, X } from 'lucide-react-native'
import Markdown from 'react-native-markdown-display' // For rendering rule summary

interface GrammarReviewCardProps {
  item: ReviewItem
  onReviewed: (outcome: ReviewOutcomePayload) => void
}

export const GrammarReviewCard: React.FC<GrammarReviewCardProps> = ({
  item,
  onReviewed
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false) // For MCQ type exercises

  // Reset state when item changes
  useEffect(() => {
    setSelectedOption(null)
    setShowAnswer(false)
  }, [item])

  const hasExerciseSnippet = !!item.exercise_snippet
  const exercise = item.exercise_snippet // Already typed as ReviewItemExerciseSnippet | undefined

  const handleSelfAssessmentOutcome = (success: boolean) => {
    onReviewed({
      interaction_success: success,
      review_timestamp_client: new Date().toISOString(),
      review_interaction_type: 'nsr_grammar_self_assess'
    })
  }

  const handleMcqOptionSelect = (option: string) => {
    if (showAnswer) return
    setSelectedOption(option)
  }

  const handleSubmitMcq = () => {
    if (!selectedOption || !exercise || exercise.exercise_type !== 'mcq') return
    setShowAnswer(true)
    // Outcome reported when "Next" is clicked after seeing feedback
  }

  const handleMcqNext = () => {
    if (
      !exercise ||
      exercise.exercise_type !== 'mcq' ||
      selectedOption === null
    )
      return
    const isCorrect = selectedOption === exercise.correct_answer
    onReviewed({
      interaction_success: isCorrect,
      review_timestamp_client: new Date().toISOString(),
      review_interaction_type: 'nsr_grammar_mcq' // Specific type
    })
  }

  const markdownStyles = StyleSheet.create({
    /* ... (same as GrammarRuleExplanationCard) ... */
    body: { fontSize: 16, lineHeight: 24, color: Colors.light.text },
    strong: { fontWeight: 'bold' }
  })

  return (
    <ScrollView
      style={styles.card}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>{item.display_text}</Text>
      <Text style={styles.detailTextSmall}>
        Grammar Review{' '}
        {item.grammar_category ? `(${item.grammar_category})` : ''}
      </Text>

      {item.grammar_rule_summary_en && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>Key Idea:</Text>
          <Markdown style={markdownStyles}>
            {item.grammar_rule_summary_en}
          </Markdown>
        </View>
      )}

      {hasExerciseSnippet && exercise && exercise.exercise_type === 'mcq' && (
        <View style={styles.exerciseContainer}>
          <Text style={styles.exercisePrompt}>{exercise.prompt}</Text>
          {exercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && styles.optionSelected,
                showAnswer &&
                  option === exercise.correct_answer &&
                  styles.optionCorrect,
                showAnswer &&
                  selectedOption === option &&
                  option !== exercise.correct_answer &&
                  styles.optionIncorrect
              ]}
              onPress={() => handleMcqOptionSelect(option)}
              disabled={showAnswer}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          {showAnswer && (
            <Text
              style={[
                styles.feedbackText,
                selectedOption === exercise.correct_answer
                  ? styles.feedbackCorrectText
                  : styles.feedbackIncorrectText
              ]}
            >
              {selectedOption === exercise.correct_answer
                ? 'Correct!'
                : `Correct answer: ${exercise.correct_answer}`}
            </Text>
          )}
        </View>
      )}
      {/* Add other exercise_snippet types here if KLearn sends them for NSR grammar */}

      <View style={styles.actions}>
        {
          !hasExerciseSnippet ? ( // Self-assessment buttons
            <>
              <TouchableOpacity
                style={[styles.button, styles.buttonBad]}
                onPress={() => handleSelfAssessmentOutcome(false)}
              >
                <Text style={styles.buttonText}>Review Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonGood]}
                onPress={() => handleSelfAssessmentOutcome(true)}
              >
                <Text style={styles.buttonText}>Understood</Text>
              </TouchableOpacity>
            </>
          ) : exercise?.exercise_type === 'mcq' ? ( // MCQ buttons
            !showAnswer ? (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  !selectedOption && styles.buttonDisabled
                ]}
                onPress={handleSubmitMcq}
                disabled={!selectedOption}
              >
                <Text style={styles.buttonText}>Check Answer</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={handleMcqNext}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            )
          ) : null /* Add buttons for other snippet types */
        }
      </View>
    </ScrollView>
  )
}

// Styles (similar to WordReviewCard and GrammarRuleExplanationCard, adapt as needed)
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20, // Adjusted padding
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    maxHeight: '90%' // Allow more height for grammar explanations
  },
  scrollContent: {
    paddingBottom: 20
  },
  title: {
    fontSize: 26, // Larger title for grammar concept
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    marginBottom: 5,
    textAlign: 'center'
  },
  detailTextSmall: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 15
  },
  explanationBox: {
    backgroundColor: Colors.light.backgroundLight,
    padding: 15,
    borderRadius: 10,
    marginVertical: 10
  },
  explanationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary,
    marginBottom: 8
  },
  // Exercise specific styles (for MCQ snippet)
  exerciseContainer: {
    marginTop: 15,
    marginBottom: 10, // Reduced margin before actions
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 15
  },
  exercisePrompt: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
    color: Colors.light.text,
    marginBottom: 15
  },
  optionButton: {
    backgroundColor: Colors.light.white, // Make options stand out
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border
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
    fontFamily: 'Inter-Regular',
    color: Colors.light.text
  },
  feedbackText: { marginTop: 10, fontSize: 15, fontFamily: 'Inter-Medium' },
  feedbackCorrectText: { color: Colors.light.success },
  feedbackIncorrectText: { color: Colors.light.error },
  // Actions
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25, // Increased margin
    paddingTop: 20, // Increased padding
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2
  },
  buttonGood: { backgroundColor: Colors.light.success },
  buttonBad: { backgroundColor: Colors.light.error },
  submitButton: { backgroundColor: Colors.light.primary, flex: 1 },
  nextButton: { backgroundColor: Colors.light.accent, flex: 1 },
  buttonDisabled: { backgroundColor: Colors.light.border, opacity: 0.7 },
  buttonText: {
    color: Colors.light.white,
    fontFamily: 'Inter-Bold',
    fontSize: 16
  }
})
