import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Brain,
  MessageSquare,
  ListChecks,
  Puzzle,
  ChevronRight
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

type ExerciseType = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  exercises: number
  backgroundColor: string
}

const exercises: ExerciseType[] = [
  {
    id: 'vocabulary',
    title: 'Vocabulary',
    description: 'Learn and review Finnish words',
    icon: <Brain size={24} color={Colors.light.white} />,
    color: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
    exercises: 12
  },
  {
    id: 'conversation',
    title: 'Conversation',
    description: 'Practice dialog and phrases',
    icon: <MessageSquare size={24} color={Colors.light.white} />,
    color: Colors.light.accent,
    backgroundColor: Colors.light.accentLight,
    exercises: 8
  },
  {
    id: 'grammar',
    title: 'Grammar',
    description: 'Master Finnish grammar rules',
    icon: <ListChecks size={24} color={Colors.light.white} />,
    color: Colors.light.success,
    backgroundColor: Colors.light.successLight,
    exercises: 5
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Fun activities to boost learning',
    icon: <Puzzle size={24} color={Colors.light.white} />,
    color: Colors.light.warning,
    backgroundColor: Colors.light.warningLight,
    exercises: 7
  }
]

const dailySuggestions = [
  {
    id: 'suggestion-greetings',
    title: 'Common Finnish Greetings',
    type: 'Vocabulary',
    duration: '10 min',
    color: Colors.light.primary
  },
  {
    id: 'suggestion-restaurant',
    title: 'Restaurant Conversations',
    type: 'Conversation',
    duration: '15 min',
    color: Colors.light.accent
  }
]

export default function ExercisesScreen() {
  const { isDesktop } = useResponsiveDimensions()

  const goToExercise = useRequireAuthAction((exerciseId: string) => {
    alert(`Navigate to exercise: ${exerciseId} (Not Implemented)`)
  }, 'Login to start practicing.')

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.wideScreenContent
        ]}
      >
        <Text style={styles.sectionTitle}>Categories</Text>
        <View
          style={[
            styles.exercisesGrid,
            isDesktop && styles.wideScreenExercisesGrid
          ]}
        >
          {exercises.map(exercise => (
            <TouchableOpacity
              key={exercise.id}
              style={[
                styles.exerciseCard,
                isDesktop && styles.wideScreenExerciseCard
              ]}
              onPress={() => goToExercise(exercise.id)}
            >
              <View
                style={[
                  styles.exerciseIconContainer,
                  { backgroundColor: exercise.color }
                ]}
              >
                {exercise.icon}
              </View>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>
              <View style={styles.exerciseInfoRow}>
                <Text style={styles.exerciseCount}>
                  {exercise.exercises} exercises
                </Text>
                <ChevronRight size={16} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Suggested For Today</Text>
        {dailySuggestions.map(suggestion => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionCard}
            onPress={() => goToExercise(suggestion.id)}
          >
            <View style={styles.suggestionContent}>
              <View
                style={[
                  styles.suggestionTypeIndicator,
                  { backgroundColor: suggestion.color }
                ]}
              />
              <View style={styles.suggestionTextContainer}>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                <View style={styles.suggestionMetaContainer}>
                  <Text style={styles.suggestionMeta}>{suggestion.type}</Text>
                  <View style={styles.metaSeparator} />
                  <Text style={styles.suggestionMeta}>
                    {suggestion.duration}
                  </Text>
                </View>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Word of the Day</Text>
        <View style={styles.wordOfDayCard}>
          <View style={styles.wordOfDayHeader}>
            <Text style={styles.finnishWord}>tervetuloa</Text>
            <Text style={styles.pronunciation}>/ter·ve·tu·lo·a/</Text>
          </View>
          <Text style={styles.englishTranslation}>welcome</Text>
          <Text style={styles.exampleTitle}>Example:</Text>
          <Text style={styles.exampleSentence}>Tervetuloa Suomeen!</Text>
          <Text style={styles.exampleTranslation}>Welcome to Finland!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text
  },
  content: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40
  },
  wideScreenContent: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%'
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 16
  },
  exercisesGrid: {
    flexDirection: 'column',
    marginBottom: 24,
    gap: 12
  },
  wideScreenExercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16
  },
  exerciseCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: '100%'
  },
  wideScreenExerciseCard: {
    width: '48%'
  },
  exerciseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 4
  },
  exerciseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    minHeight: 35
  },
  exerciseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto'
  },
  exerciseCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  suggestionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  suggestionTypeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12
  },
  suggestionTextContainer: {
    flex: 1
  },
  suggestionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  suggestionMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  suggestionMeta: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  metaSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.light.textSecondary,
    marginHorizontal: 8
  },
  wordOfDayCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  wordOfDayHeader: {
    marginBottom: 8
  },
  finnishWord: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 4
  },
  pronunciation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  englishTranslation: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.primary,
    marginBottom: 16
  },
  exampleTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4
  },
  exampleSentence: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    fontStyle: 'italic',
    marginBottom: 4
  },
  exampleTranslation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  }
})
