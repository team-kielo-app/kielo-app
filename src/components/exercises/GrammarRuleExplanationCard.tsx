// src/components/exercises/GrammarRuleExplanationCard.tsx
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native'
import { Colors } from '@constants/Colors'
import { KLearnGrammarRuleExplanationExercise } from '@features/lessons/types'
import Markdown from 'react-native-markdown-display' // +++ Import Markdown

interface GrammarRuleExplanationCardProps {
  exercise: KLearnGrammarRuleExplanationExercise
  onAnswered: (isCorrect: boolean, userAnswer: string) => void
}

export const GrammarRuleExplanationCard: React.FC<
  GrammarRuleExplanationCardProps
> = ({ exercise, onAnswered }) => {
  const handleAcknowledge = () => {
    onAnswered(true, 'acknowledged')
  }

  // Define styles for Markdown elements if needed
  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: Colors.light.text
    },
    heading1: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 5,
      color: Colors.light.primary
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 8,
      marginBottom: 4,
      color: Colors.light.primary
    },
    strong: { fontWeight: 'bold', color: Colors.light.text }, // Ensure bold text is visible
    em: { fontStyle: 'italic' },
    list_item: { marginVertical: 4 }
    // Add other styles as needed
  })

  return (
    <View style={styles.card}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.title}>Grammar Explanation</Text>
        {/* item_id_fk is now part of KLearnExerciseBase, so it's always available if KLearn sends it */}
        <Text style={styles.conceptInfo}>Focus: {exercise.item_id_fk}</Text>

        <Markdown style={markdownStyles}>{exercise.prompt}</Markdown>
      </ScrollView>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.acknowledgeButton]}
          onPress={handleAcknowledge}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles (mostly the same, ensure explanationText or markdown body style is appropriate)
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    paddingVertical: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    flex: 1,
    maxHeight: '85%'
  },
  scrollContainer: {
    flex: 1
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold',
    color: Colors.light.primary,
    marginBottom: 15
  },
  conceptInfo: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.textSecondary,
    marginBottom: 10,
    fontStyle: 'italic'
  },
  // `explanationText` style is now handled by Markdown styles `body`
  actions: {
    marginTop: 15,
    paddingTop: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  acknowledgeButton: {
    backgroundColor: Colors.light.primary
  },
  buttonText: {
    color: Colors.light.white,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold'
  }
})
