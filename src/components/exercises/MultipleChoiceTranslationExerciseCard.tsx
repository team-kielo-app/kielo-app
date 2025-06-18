import React, { useState, useMemo, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native'
import { Colors } from '@constants/Colors'
import { Check, X as IconX, Volume2 } from 'lucide-react-native'
import { KLearnMCTranslationExercise } from '@features/lessons/types'

const quizIconPlaceholder =
  'https://cdn-icons-png.flaticon.com/512/2490/2490421.png'

interface MCTranslationCardProps {
  exercise: KLearnMCTranslationExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void
  currentQuestionNumber?: number
  totalQuestions?: number
  questionPoints?: number
  questionTimeLimit?: number
}

export function MultipleChoiceTranslationExerciseCard({
  exercise,
  onAnswered,
  currentQuestionNumber,
  totalQuestions,
  questionPoints,
  questionTimeLimit
}: MCTranslationCardProps): React.ReactElement {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | undefined>(
    questionTimeLimit
  )

  const options = useMemo(() => {
    const allOptionTexts = [
      exercise.correct_translation,
      ...exercise.distractor_translations
    ]
    return allOptionTexts.sort(() => Math.random() - 0.5)
  }, [exercise.correct_translation, exercise.distractor_translations])

  const isCorrect = useMemo(() => {
    if (!selectedAnswer) return false
    return (
      selectedAnswer.trim().toLowerCase() ===
      exercise.correct_translation.trim().toLowerCase()
    )
  }, [selectedAnswer, exercise.correct_translation])

  useEffect(() => {
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setTimeLeft(questionTimeLimit)
  }, [exercise, questionTimeLimit])

  useEffect(() => {
    if (timeLeft === undefined || timeLeft <= 0 || isSubmitted) {
      if (timeLeft === 0 && !isSubmitted) {
        handleSubmit(true)
      }
      return
    }
    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1)
    }, 1000)
    return () => clearTimeout(timerId)
  }, [timeLeft, isSubmitted])

  const handleSelectOption = (optionText: string) => {
    if (isSubmitted) return
    setSelectedAnswer(optionText)
  }

  const handleSubmit = (timeout: boolean = false) => {
    if (!selectedAnswer && !timeout) return
    setIsSubmitted(true)
  }

  const handleNext = () => {
    onAnswered(isCorrect, selectedAnswer || 'timeout')
  }

  const playSourcePhraseAudio = () => {
    Alert.alert('Play Audio', `Playing: ${exercise.source_phrase}`)
  }

  return (
    <View style={styles.card}>
      {(currentQuestionNumber ||
        questionPoints !== undefined ||
        timeLeft !== undefined) && (
        <View style={styles.questionInfoHeader}>
          {currentQuestionNumber && totalQuestions > 1 && (
            <View style={styles.questionNumberBadge}>
              <Text style={styles.questionNumberText}>
                Q{currentQuestionNumber}
              </Text>
            </View>
          )}
          {questionPoints !== undefined && (
            <Text style={styles.pointsText}>{questionPoints} points</Text>
          )}
          {timeLeft !== undefined && (
            <Text style={styles.timerText}>
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </Text>
          )}
        </View>
      )}

      <View style={styles.questionContentContainer}>
        <Text style={styles.questionText}>{exercise.prompt}</Text>
        <TouchableOpacity
          style={styles.audioPromptContainer}
          onPress={playSourcePhraseAudio}
        >
          <Volume2 size={20} color={Colors.light.secondary} />
          <Text style={styles.audioPromptText}>
            Tap to hear "{exercise.source_phrase}"
          </Text>
        </TouchableOpacity>
        <View style={styles.visualAidContainer}>
          <Image
            source={{ uri: quizIconPlaceholder }}
            style={styles.visualAidIcon}
          />
        </View>
      </View>

      <View style={styles.optionsGridContainer}>
        {options.map((optionText, index) => (
          <TouchableOpacity
            key={`mcq-opt-${index}-${optionText.substring(0, 5)}`}
            style={[
              styles.optionButton,
              selectedAnswer === optionText && styles.optionSelected,
              isSubmitted &&
                optionText === exercise.correct_translation &&
                styles.optionCorrect,
              isSubmitted &&
                selectedAnswer === optionText &&
                optionText !== exercise.correct_translation &&
                styles.optionIncorrect
            ]}
            onPress={() => handleSelectOption(optionText)}
            disabled={isSubmitted}
          >
            <View style={styles.optionLabelContainer}>
              <Text style={styles.optionLabel}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={styles.optionButtonText}>{optionText}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isSubmitted && (
        <View style={styles.feedbackSection}>
          <View
            style={[
              styles.feedbackBox,
              isCorrect
                ? styles.feedbackBoxCorrect
                : styles.feedbackBoxIncorrect
            ]}
          >
            {isCorrect ? (
              <Check size={20} color={Colors.light.success} />
            ) : (
              <IconX size={20} color={Colors.light.error} />
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
                ? 'Correct!'
                : `Correct: ${exercise.correct_translation}`}
            </Text>
          </View>
          {exercise.explanation && !isCorrect && (
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
              !selectedAnswer && styles.buttonDisabled
            ]}
            onPress={() => handleSubmit()}
            disabled={!selectedAnswer}
          >
            <Text style={styles.actionButtonText}>Check Answer</Text>
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
    backgroundColor: Colors.light.quizQuestionCardBg,
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6
  },
  questionInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4
  },
  questionNumberBadge: {
    backgroundColor: Colors.light.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  questionNumberText: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: Colors.light.secondary
  },
  pointsText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.warning
  },
  timerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  questionContentContainer: {
    backgroundColor: Colors.light.quizQuestionCardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center'
  },
  questionText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8
  },
  audioPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 12
  },
  audioPromptText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.secondary
  },
  visualAidContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  visualAidIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
  optionsGridContainer: {
    marginBottom: 20
  },
  optionButton: {
    backgroundColor: Colors.light.quizOptionBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.light.quizOptionBorder
  },
  optionLabelContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  optionLabel: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.textSecondary,
    fontSize: 13
  },
  optionButtonText: {
    fontFamily: 'Inter-Medium',
    color: Colors.light.text,
    fontSize: 15,
    flex: 1
  },
  optionSelected: {
    borderColor: Colors.light.quizOptionSelectedBorder,
    backgroundColor: Colors.light.quizOptionSelectedBg
  },
  optionCorrect: {
    borderColor: Colors.light.quizCorrectBorder,
    backgroundColor: Colors.light.quizCorrectBg
  },
  optionIncorrect: {
    borderColor: Colors.light.quizIncorrectBorder,
    backgroundColor: Colors.light.quizIncorrectBg
  },
  feedbackSection: {
    marginBottom: 15
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8
  },
  feedbackBoxCorrect: {
    borderColor: Colors.light.success,
    backgroundColor: Colors.light.successBackground
  },
  feedbackBoxIncorrect: {
    borderColor: Colors.light.error,
    backgroundColor: Colors.light.errorBackground
  },
  feedbackText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Inter-Medium'
  },
  explanationText: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    paddingLeft: 28
  },
  actionBar: {
    marginTop: 10,
    paddingTop: 10
  },
  actionButton: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    backgroundColor: Colors.light.quizSubmitButtonBg
  },
  nextButton: {
    backgroundColor: Colors.light.quizNextButtonBg
  },
  buttonDisabled: {
    backgroundColor: Colors.light.buttonDisabledBackground,
    opacity: 0.7
  },
  actionButtonText: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-Bold',
    fontSize: 15
  }
})
