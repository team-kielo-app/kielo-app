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
  ChevronRight,
  Sparkles,
  Volume2,
  Trophy
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/store/store'

import {
  fetchSuggestedLessonsThunk,
  selectSuggestedLessons,
  selectSuggestedLessonsStatus
} from '@features/lessons/lessonsSlice'
import { LessonData } from '@/features/lessons/types'

const exerciseCategories = [
  {
    id: 'nsr_review_session',
    title: 'Daily Flashcards',
    description: 'Practice words & grammar due for review',
    icon: <Brain size={24} color={Colors.light.primaryContent} />,
    color: Colors.light.primary,
    targetPath: '/(main)/exercises/review-session'
  }
]

export default function ExercisesScreen(): React.ReactElement {
  const { isDesktop } = useResponsiveDimensions()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()

  const suggestedLessons = useSelector(selectSuggestedLessons)
  const lessonsStatus = useSelector(selectSuggestedLessonsStatus)

  useEffect(() => {
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
    navigateToScreen(`/(main)/exercises/player`, {
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
        <Text style={styles.sectionTitle}>Daily Challenge</Text>
        <TouchableOpacity
          style={styles.challengeCard}
          onPress={() => router.push('/(main)/challenges/daily')}
          accessibilityRole="button"
          accessibilityLabel="Start daily challenge: Complete a News Article"
        >
          <View style={styles.challengeContent}>
            <View style={styles.challengeIconContainer}>
              <Trophy size={24} color={Colors.common.white} />
            </View>
            <View style={styles.challengeTextContainer}>
              <Text style={styles.challengeTitle}>Complete a News Article</Text>
              <Text style={styles.challengeSubtitle}>
                Read and learn 5 new words
              </Text>
            </View>
          </View>
          <View style={styles.challengeContentRight}>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </View>
        </TouchableOpacity>

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
            <View
              style={[
                styles.suggestionIconContainer,
                { backgroundColor: Colors.light.accentOrange }
              ]}
            >
              <Sparkles size={22} color={Colors.light.primaryContent} />
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

        <Text style={styles.sectionTitle}>Word of the Day</Text>
        <View style={styles.wordOfDayCard}>
          <View style={styles.wordOfDayHeader}>
            <Text style={styles.finnishWord}>tervetuloa</Text>
            <Text style={styles.pronunciation}>/ter·ve·tu·lo·a/</Text>
          </View>
          <Text style={styles.englishTranslation}>welcome</Text>
          <TouchableOpacity style={styles.wodListenButton}>
            <Volume2 size={18} color={Colors.light.primary} />
            <Text style={styles.wodListenButtonText}>Listen</Text>
          </TouchableOpacity>
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
    paddingTop: 10,
    paddingBottom: 12
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90
  },
  wideScreenContent: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%'
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 12
  },
  errorText: {
    textAlign: 'center',
    color: Colors.light.error,
    marginVertical: 15,
    fontFamily: 'Inter-Regular'
  },
  emptySectionText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    marginVertical: 15,
    paddingHorizontal: 20,
    fontFamily: 'Inter-Regular'
  },

  challengeCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
    flex: 1
  },
  challengeContentRight: {},
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  challengeTextContainer: {
    flex: 1
  },
  challengeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  challengeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  suggestionCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  suggestionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 4,
    lineHeight: 18
  },
  suggestionMeta: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.primary
  },
  exercisesGrid: {
    flexDirection: 'column',
    gap: 16
  },
  wideScreenExercisesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  exerciseCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    minHeight: 160,
    justifyContent: 'space-between'
  },
  wideScreenExerciseCard: {
    width: 'calc(50% - 8px)'
  },
  exerciseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    lineHeight: 20,
    flexGrow: 1
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
  wordOfDayCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  wordOfDayHeader: {
    alignItems: 'center',
    marginBottom: 8
  },
  finnishWord: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: Colors.light.text,
    marginBottom: 4
  },
  pronunciation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12
  },
  englishTranslation: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.primary,
    marginBottom: 16
  },
  wodListenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  wodListenButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 6
  }
})
