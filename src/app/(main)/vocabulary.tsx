import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useProtectedRoute } from '@hooks/useProtectedRoute'
import { Colors } from '@constants/Colors'
import { ScreenHeader } from '@components/common/ScreenHeader'
import { Volume2, BookHeart } from 'lucide-react-native'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from '@/store/store'
import { fetchVocabularyThunk } from '@features/vocabulary/vocabularyActions'
import { UserVocabularyEntry } from '@features/vocabulary/types'
import { useRefresh } from '@hooks/useRefresh'
import {
  selectAllVocabulary,
  selectVocabularyListStatus
} from '@/features/vocabulary/vocabularySlice'

export default function VocabularyScreen(): React.ReactElement | null {
  const { isLoading: isAuthLoading, isAuthenticated } = useProtectedRoute()
  const dispatch = useDispatch<AppDispatch>()
  const insets = useSafeAreaInsets()

  const vocabularyEntries = useSelector(selectAllVocabulary)
  const vocabularyStatus = useSelector(selectVocabularyListStatus)
  const vocabularyError = useSelector(
    (state: RootState) => state.vocabulary.error
  )

  const fetchData = useCallback(() => {
    if (
      isAuthenticated &&
      (vocabularyStatus === 'idle' || vocabularyStatus === 'failed')
    ) {
      dispatch(fetchVocabularyThunk())
    }
  }, [dispatch, isAuthenticated, vocabularyStatus])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const [isPullRefreshing, handlePullRefresh] = useRefresh(async () => {
    if (isAuthenticated) {
      await dispatch(fetchVocabularyThunk())
    }
  })

  if (isAuthLoading || !isAuthenticated) {
    return (
      <View style={styles.fullScreenLoader}>
        <ScreenHeader
          title="My Vocabulary"
          fallbackPath="/(main)/(tabs)/profile"
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    )
  }

  const playPronunciation = (word: string) => {
    Alert.alert(
      'Play Audio',
      `Playing pronunciation for: ${word} (Not Implemented)`
    )
  }

  const renderItem = ({
    item
  }: {
    item: UserVocabularyEntry
  }): React.ReactElement => (
    <View style={styles.itemContainer}>
      <View style={styles.wordRow}>
        <View style={styles.wordTextContainer}>
          <Text style={styles.finnishWord}>
            {item.base_word?.word_fi || item.base_word_id}
          </Text>
          {item.base_word?.pronunciation_ipa && (
            <Text style={styles.pronunciation}>
              {item.base_word.pronunciation_ipa}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() =>
            playPronunciation(item.base_word?.word_fi || item.base_word_id)
          }
          style={styles.audioButton}
          accessibilityLabel={`Play audio for ${item.base_word?.word_fi}`}
        >
          <Volume2 size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.englishWord}>
        {item.base_word?.basic_definition_en || 'No translation available.'}
      </Text>
    </View>
  )

  const renderEmptyList = () => {
    if (vocabularyStatus === 'loading') {
      return (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.infoText}>Loading vocabulary...</Text>
        </View>
      )
    }
    if (vocabularyStatus === 'failed') {
      return (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>Could not load your vocabulary.</Text>
          {vocabularyError && (
            <Text style={styles.errorSubText}>{vocabularyError}</Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (vocabularyStatus === 'succeeded' && vocabularyEntries.length === 0) {
      return (
        <View style={styles.centeredMessageContainer}>
          <BookHeart
            size={48}
            color={Colors.light.textTertiary}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyText}>
            You haven't saved any vocabulary yet.
          </Text>
          <Text style={styles.emptySubText}>
            Words you save or mark for learning will appear here.
          </Text>
        </View>
      )
    }
    return null
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="My Vocabulary"
        fallbackPath="/(main)/(tabs)/profile"
      />
      <FlatList
        data={vocabularyEntries}
        keyExtractor={item => item.base_word_id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={Colors.light.primary}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary
  },
  fullScreenLoader: { flex: 1, backgroundColor: Colors.light.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    padding: 16 // Consistent padding
  },
  itemContainer: {
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 12, // More rounded
    marginBottom: 12,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.light.borderSubtle
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align start for potentially multi-line words
    justifyContent: 'space-between',
    marginBottom: 6
  },
  wordTextContainer: {
    flex: 1, // Allow text to take space
    marginRight: 8
  },
  finnishWord: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    flexShrink: 1 // Allow shrinking if too long
  },
  englishWord: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary, // Use primary color for translation
    lineHeight: 20
  },
  pronunciation: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginTop: 2
  },
  audioButton: {
    padding: 6, // Good tap area
    marginTop: -4 // Align nicely with potentially taller Finnish word
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 250
  },
  infoText: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular'
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.textSecondary,
    marginBottom: 8
  },
  emptySubText: {
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textTertiary,
    paddingHorizontal: 20,
    lineHeight: 20
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.error,
    fontFamily: 'Inter-Medium',
    marginBottom: 5
  },
  errorSubText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: 'Inter-Regular',
    marginBottom: 15
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: Colors.light.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  retryButtonText: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-SemiBold',
    fontSize: 14
  }
})
