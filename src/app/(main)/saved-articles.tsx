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
import { ArticleCard } from '@/components/reader/ArticleCard' // Assuming exists
import { useRouter } from 'expo-router'

// Filled Mock saved articles
const mockSavedArticles = [
  {
    id: '101',
    title: 'Finland Celebrates Midsummer',
    subtitle: 'Traditions and festivities across the country.',
    imageUrl: 'https://picsum.photos/seed/101/300/200',
    date: '2024-06-21',
    category: 'Culture',
    readingTime: 5,
    difficulty: 'Intermediate'
  },
  {
    id: '102',
    title: 'Helsinki Design Week Highlights',
    subtitle: 'Innovative designs showcased in the capital.',
    imageUrl: 'https://picsum.photos/seed/102/300/200',
    date: '2024-09-10',
    category: 'Culture',
    readingTime: 4,
    difficulty: 'Beginner'
  },
  {
    id: '103',
    title: 'Exploring Nuuksio National Park',
    subtitle: 'A guide to trails and nature.',
    imageUrl: 'https://picsum.photos/seed/103/300/200',
    date: '2024-08-05',
    category: 'Nature',
    readingTime: 6,
    difficulty: 'Beginner'
  }
]

export default function SavedArticlesScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const router = useRouter()
  // TODO: Fetch actual saved articles

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Saved Articles"
        fallbackPath="/(main)/(tabs)/profile"
      />
      <FlatList
        data={mockSavedArticles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            onPress={() => router.push(`/(main)/article/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't saved any articles yet.
          </Text>
        }
      />
    </View>
  )
}

// Styles based on previous implementation
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  listContent: { padding: 20, paddingTop: 8, gap: 16 }, // Use gap for spacing
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  }
})
