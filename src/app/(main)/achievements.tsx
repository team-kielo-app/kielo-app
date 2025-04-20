import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { AchievementCard } from '@/components/profile/AchievementCard' // Assuming exists

// Filled Mock achievements data
const mockAchievements = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first article',
    progress: 1,
    total: 1,
    color: Colors.light.success,
    earned: true
  },
  {
    id: '2',
    title: 'Word Collector',
    description: 'Learn 100 Finnish words',
    progress: 145,
    total: 100,
    color: Colors.light.primary,
    earned: true
  },
  {
    id: '3',
    title: 'Dedicated Reader',
    description: 'Read articles for 5 days in a row',
    progress: 7,
    total: 5,
    color: Colors.light.accent,
    earned: true
  },
  {
    id: '4',
    title: 'Vocabulary Master',
    description: 'Learn 500 Finnish words',
    progress: 145,
    total: 500,
    color: Colors.light.warning,
    earned: false
  },
  {
    id: '5',
    title: 'Weekend Warrior',
    description: 'Study for 60 mins on a weekend',
    progress: 30,
    total: 60,
    color: Colors.light.info,
    earned: false
  },
  {
    id: '6',
    title: 'Grammar Guru',
    description: 'Complete 10 grammar exercises',
    progress: 5,
    total: 10,
    color: Colors.light.success,
    earned: false
  },
  {
    id: '7',
    title: 'Night Owl',
    description: 'Study after 10 PM',
    progress: 1,
    total: 1,
    color: Colors.light.textSecondary,
    earned: true
  }
]

export default function AchievementsScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  // TODO: Fetch actual achievements

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Achievements"
        fallbackPath="/(main)/(tabs)/profile"
      />
      <FlatList
        data={mockAchievements}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AchievementCard achievement={item} style={styles.achievementCard} />
        )}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No achievements earned yet.</Text>
        }
      />
    </View>
  )
}

// Styles based on previous implementation
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  listContent: { padding: 20 },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16
  },
  achievementCard: {
    // Style passed to AchievementCard component
    width: '48%' // Ensure width allows for gap
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  }
})
