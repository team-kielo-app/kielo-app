import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { useDispatch } from 'react-redux'
import { Colors } from '@constants/Colors'
import { KLearnFlashcardExercise } from '@features/lessons/types'
import { AppDispatch } from '@/store/store'

interface FlashcardExerciseCardProps {
  exercise: KLearnFlashcardExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void
}

export const FlashcardExerciseCard: React.FC<FlashcardExerciseCardProps> = ({
  exercise,
  onAnswered
}) => {
  const [isFlipped, setIsFlipped] = useState(false)
  const [fetchedAnswer, setFetchedAnswer] = useState<string | null>(null)
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    setIsFlipped(false)
    setFetchedAnswer(null)
    setIsLoadingAnswer(false)

    if (
      !exercise.answer_text &&
      exercise.item_id_fk &&
      exercise.item_type_fk === 'word'
    ) {
      setIsLoadingAnswer(true)
      console.log(
        `Flashcard: Would fetch details for word ID: ${exercise.item_id_fk}`
      )

      setTimeout(() => {
        const mockDetails = {
          primary_translation_en: `Translation for ${
            exercise.prompt.split(' ')[0]
          }`
        }
        setFetchedAnswer(mockDetails.primary_translation_en)
        setIsLoadingAnswer(false)
      }, 1000)
    }
  }, [exercise, dispatch])

  const displayAnswer =
    exercise.answer_text || fetchedAnswer || 'Loading answer...'

  const handleSelfAssessment = (knewIt: boolean) => {
    onAnswered(
      knewIt,
      knewIt ? 'self_assessed_correct' : 'self_assessed_incorrect'
    )
    setIsFlipped(false)
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.flipContainer}
        onPress={() => setIsFlipped(!isFlipped)}
        activeOpacity={0.7}
      >
        {!isFlipped ? (
          <View style={styles.front}>
            <Text style={styles.promptTextContent}>{exercise.prompt}</Text>
            <Text style={styles.tapToRevealText}>(Tap to reveal)</Text>
          </View>
        ) : (
          <View style={styles.back}>
            {isLoadingAnswer ? (
              <ActivityIndicator color={Colors.light.primary} size="small" />
            ) : (
              <Text style={styles.answerTextContent}>{displayAnswer}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {isFlipped && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonBad]}
            onPress={() => handleSelfAssessment(false)}
          >
            <Text style={styles.buttonText}>Didn't Know</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonGood]}
            onPress={() => handleSelfAssessment(true)}
          >
            <Text style={styles.buttonText}>Knew It!</Text>
          </TouchableOpacity>
        </View>
      )}
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
    elevation: 6,
    minHeight: 250,
    justifyContent: 'space-between'
  },
  flipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20
  },
  front: { alignItems: 'center', padding: 10 },
  back: { alignItems: 'center', padding: 10 },
  promptTextContent: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 10
  },
  tapToRevealText: {
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  answerTextContent: {
    fontSize: 22,
    color: Colors.light.primary,
    textAlign: 'center',
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center'
  },
  buttonGood: { backgroundColor: Colors.light.success },
  buttonBad: { backgroundColor: Colors.light.error },
  buttonText: {
    color: Colors.common.white,
    fontWeight: 'bold',
    fontSize: 16
  }
})
