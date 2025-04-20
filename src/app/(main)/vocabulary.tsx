import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { Volume2 } from 'lucide-react-native'

// Filled Mock vocabulary data
const mockVocabulary = [
  {
    id: 'word1',
    finnish: 'tervetuloa',
    english: 'welcome',
    pronunciation: '/ter·ve·tu·lo·a/'
  },
  {
    id: 'word2',
    finnish: 'kiitos',
    english: 'thank you',
    pronunciation: '/kii·tos/'
  },
  {
    id: 'word3',
    finnish: 'anteeksi',
    english: 'excuse me / sorry',
    pronunciation: '/an·teek·si/'
  },
  {
    id: 'word4',
    finnish: 'hyvää päivää',
    english: 'good day',
    pronunciation: '/hy·væː·pæi·væː/'
  },
  {
    id: 'word5',
    finnish: 'näkemiin',
    english: 'goodbye',
    pronunciation: '/næ·ke·miin/'
  }
]

export default function VocabularyScreen() {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  // TODO: Fetch actual vocabulary

  if (isAuthLoading) {
    /* ... loading state ... */
  }
  if (!isAuthenticated) return null

  const playPronunciation = (word: string) => {
    alert(`Playing pronunciation for: ${word} (Not Implemented)`)
  }

  const renderItem = ({ item }: { item: (typeof mockVocabulary)[0] }) => (
    <View style={styles.itemContainer}>
      <View style={styles.wordRow}>
        <Text style={styles.finnishWord}>{item.finnish}</Text>
        <TouchableOpacity
          onPress={() => playPronunciation(item.finnish)}
          style={styles.audioButton}
        >
          <Volume2 size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.pronunciation}>{item.pronunciation}</Text>
      <Text style={styles.englishWord}>{item.english}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Vocabulary"
        fallbackPath="/(main)/(tabs)/profile"
      />
      <FlatList
        data={mockVocabulary}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't saved any vocabulary yet.
          </Text>
        }
      />
    </View>
  )
}

// Styles based on previous implementation
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  listContent: { padding: 20 },
  itemContainer: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  finnishWord: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold', // Use font
    color: Colors.light.text,
    flexShrink: 1,
    marginRight: 8
  },
  englishWord: {
    fontSize: 16,
    fontFamily: 'Inter-Medium', // Use font
    color: Colors.light.primary
  },
  pronunciation: {
    fontSize: 13,
    fontFamily: 'Inter-Regular', // Use font
    color: Colors.light.textSecondary,
    marginBottom: 6,
    fontStyle: 'italic'
  },
  audioButton: {
    padding: 4
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  }
})
