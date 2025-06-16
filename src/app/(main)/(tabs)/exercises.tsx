// src/app/(main)/(tabs)/exercises.tsx
import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  Brain,
  MessageSquare,
  ListChecks,
  Puzzle,
  ChevronRight,
  Sparkles // For suggested lessons
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'

// Let's assume a new slice for "suggested lessons" (WPR)
// This is a simplified version. In reality, these would be fetched.
import {
  fetchSuggestedLessonsThunk,
  selectSuggestedLessons,
  selectSuggestedLessonsStatus,
  SuggestedLesson // Define this type
} from '@features/lessons/lessonsSlice' // Assuming a lessonsSlice exists
import { LessonData } from '@/features/lessons/types'
import { DailyChallenge } from '@/components/home/DailyChallenge'

// Existing categories - can be static or fetched if they become dynamic
const exerciseCategories = [
  {
    id: 'nsr_review_session', // More specific ID
    title: 'Daily Review (SRS)', // Clearer title
    description: 'Practice words & grammar due for review',
    icon: <Brain size={24} color={Colors.light.white} />,
    color: Colors.light.primary,
    targetPath: '/(main)/exercises/review-session' // Correct path
  }
]

export default function ExercisesScreen() {
  const { isDesktop } = useResponsiveDimensions()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const suggestedLessons = useSelector(selectSuggestedLessons) // From lessonsSlice
  const lessonsStatus = useSelector(selectSuggestedLessonsStatus) // From lessonsSlice

  useEffect(() => {
    // Fetch suggested lessons (WPR)
    if (lessonsStatus === 'idle') {
      dispatch(fetchSuggestedLessonsThunk({ max_suggestions: 3 }))
    }
  }, [dispatch, lessonsStatus])

  const navigateToScreen = useRequireAuthAction(
    (path: string, params?: Record<string, any>) => {
      router.push({ pathname: path, params })
    },
    'Login to start practicing.'
  )

  const handleCategoryPress = (category: (typeof exerciseCategories)[0]) => {
    navigateToScreen(category.targetPath)
  }

  const handleSuggestedLessonPress = (lesson: LessonData) => {
    // lesson is now LessonData
    navigateToScreen(`/(main)/exercises/player`, {
      // Path no longer needs [lesson_id]
      lessonDataString: JSON.stringify(lesson)
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Hub</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.wideScreenContent
        ]}
      >
        <DailyChallenge
          onStartChallenge={() => router.push('/(main)/challenges/daily')}
        />

        {/* Suggested Lessons (WPR) */}
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        {lessonsStatus === 'loading' && (
          <ActivityIndicator
            color={Colors.light.primary}
            style={{ marginVertical: 20 }}
          />
        )}
        {lessonsStatus === 'failed' && (
          <Text style={styles.errorText}>Could not load recommendations.</Text>
        )}
        {lessonsStatus === 'succeeded' && suggestedLessons.length === 0 && (
          <Text style={styles.emptySectionText}>
            No specific recommendations right now. Explore categories below!
          </Text>
        )}
        {suggestedLessons.map(lesson => (
          <TouchableOpacity
            key={lesson.lesson_id}
            style={styles.suggestionCard}
            onPress={() => handleSuggestedLessonPress(lesson)}
          >
            <View style={styles.suggestionIconContainer}>
              <Sparkles size={22} color={Colors.light.white} />
            </View>
            <View style={styles.suggestionTextContainer}>
              <Text style={styles.suggestionTitle}>{lesson.lesson_title}</Text>
              <Text style={styles.suggestionDescription} numberOfLines={2}>
                {lesson.description}
              </Text>
              <Text style={styles.suggestionMeta}>
                Approx. {lesson.estimated_duration_minutes || '?'} min
              </Text>
            </View>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ))}

        {/* Static Exercise Categories */}
        <Text style={styles.sectionTitle}>Practice Areas</Text>
        <View
          style={[
            styles.exercisesGrid,
            isDesktop && styles.wideScreenExercisesGrid
          ]}
        >
          {exerciseCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.exerciseCard,
                isDesktop && styles.wideScreenExerciseCard
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <View
                style={[
                  styles.exerciseIconContainer,
                  { backgroundColor: category.color }
                ]}
              >
                {category.icon}
              </View>
              <Text style={styles.exerciseTitle}>{category.title}</Text>
              <Text style={styles.exerciseDescription} numberOfLines={2}>
                {category.description}
              </Text>
              <View style={styles.exerciseInfoRow}>
                <Text style={styles.exerciseCount}>Explore</Text>
                <ChevronRight size={16} color={Colors.light.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Word of the Day (Can remain static or be fetched) */}
        <Text style={styles.sectionTitle}>Word of the Day</Text>
        <View style={styles.wordOfDayCard}>
          {/* ... Word of the day content ... */}
          <View style={styles.wordOfDayHeader}>
            <Text style={styles.finnishWord}>tervetuloa</Text>
            <Text style={styles.pronunciation}>/ter·ve·tu·lo·a/</Text>
          </View>
          <Text style={styles.englishTranslation}>welcome</Text>
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
    marginTop: 20,
    marginBottom: 16
  },
  errorText: {
    textAlign: 'center',
    color: Colors.light.error,
    marginVertical: 15
  },
  emptySectionText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    marginVertical: 15,
    paddingHorizontal: 20
  },
  // Suggested Lesson Card
  suggestionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.accent, // Example color
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  suggestionTextContainer: {
    flex: 1,
    marginRight: 8
  },
  suggestionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2
  },
  suggestionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4
  },
  suggestionMeta: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.primary
  },
  // Exercise Category Card (retained styles)
  exercisesGrid: {
    flexDirection: 'column', // Mobile: column
    gap: 12
  },
  wideScreenExercisesGrid: {
    flexDirection: 'row', // Desktop: row
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Distribute cards
    gap: 16 // Gap between cards
  },
  exerciseCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    width: '100%', // Mobile: full width
    minHeight: 150, // Ensure cards have some height
    justifyContent: 'space-between'
  },
  wideScreenExerciseCard: {
    width: '48%' // Desktop: roughly 2 per row, accounting for gap
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  exerciseTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 17,
    color: Colors.light.text,
    marginBottom: 4
  },
  exerciseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    flexGrow: 1 // Allow description to take space
  },
  exerciseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto' // Push to bottom
  },
  exerciseCount: {
    // Renamed to "Explore" or similar
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  // Word of the Day Card (retained styles)
  wordOfDayCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2
  },
  wordOfDayHeader: { marginBottom: 8 },
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
    color: Colors.light.primary
  }
})
