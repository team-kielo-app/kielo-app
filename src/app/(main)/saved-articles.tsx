import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView
} from 'react-native'
import { Stack } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchSavedItemsThunk,
  unsaveItemThunk
} from '@features/savedItems/savedItemsActions'
import {
  selectSavedItemsStatus,
  selectHydratedSavedArticles, // Use new selector for hydrated articles
  selectSavedItemReferences // If you need to display other types or just the refs
} from '@features/savedItems/savedItemsSlice'
import { useRefresh } from '@hooks/useRefresh'
import { Colors } from '@constants/Colors'
import { showAuthDebugToast } from '@lib/debugToast'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { XCircle } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import type { Article } from '@/features/articles/types'
import { CustomFlatList } from '@/components/common/CustomFlatList'

export default function LibraryScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  // Get hydrated articles. For other types, you'll need similar selectors or a combined one.
  const savedArticles = useSelector(selectHydratedSavedArticles)
  // If you need to display a mix or just the raw references:
  // const savedItemReferences = useSelector(selectSavedItemReferences);
  const status = useSelector(selectSavedItemsStatus)
  const error = useSelector((state: RootState) => state.savedItems.error) // Get error state

  // --- Initial Fetch & Refetch on Focus ---
  // Using useEffect for simplicity, consider useFocusEffect for real navigation
  useEffect(() => {
    // Fetch only if idle or if data is empty (e.g., after logout/clear)
    if (status === 'idle' || savedArticles.length === 0) {
      console.log('LibraryScreen: Fetching saved items...')
      dispatch(fetchSavedItemsThunk())
    }
    // Optional: Refetch periodically or on focus using useFocusEffect
  }, [dispatch, status])

  // --- Refresh Logic ---
  const handleRefreshAction = useCallback(() => {
    console.log('LibraryScreen: Refreshing saved items...')
    // Always refetch on pull-to-refresh
    return dispatch(fetchSavedItemsThunk())
  }, [dispatch])
  const [isRefreshing, handleRefresh] = useRefresh(handleRefreshAction)

  const refreshControlElement = React.useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        colors={[Colors.light.primary]}
        tintColor={Colors.light.primary}
      />
    ),
    [isRefreshing, handleRefresh]
  )

  // --- Unsave Handler ---
  const handleUnsave = useCallback(
    async (itemType: string, itemId: string) => {
      showAuthDebugToast('info', `Unsacing ${itemType} ${itemId}...`) // Immediate feedback
      try {
        await dispatch(
          unsaveItemThunk({ item_type: itemType, item_id: itemId })
        )
        showAuthDebugToast('success', 'Item Unsaved')
        // List updates automatically via Redux slice reducer on success
      } catch (err: any) {
        console.error('Unsave failed:', err)
        showAuthDebugToast(
          'error',
          'Unsave Failed',
          err?.message || 'Could not remove item.'
        )
      }
    },
    [dispatch]
  )

  // --- Render Item Logic ---
  const renderSavedArticle = ({ item }: { item: Article }) => {
    // item is now inferred as SavedArticleItem
    return (
      <View style={styles.itemContainer}>
        <ArticleCardWithThumbnail
          article={item} // Pass the full article object
          size="small"
        />
        <TouchableOpacity
          style={styles.unsaveButton}
          onPress={() => handleUnsave('ArticleVersion', item.id)}
        >
          <XCircle size={22} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    )
  }

  // --- Loading / Error / Empty States ---
  const renderContent = () => {
    if (status === 'loading' && savedArticles.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )
    }
    if (status === 'failed' && savedArticles.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Error loading saved items: {error}
          </Text>
          <TouchableOpacity onPress={() => dispatch(fetchSavedItemsThunk())}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }
    if (savedArticles.length === 0 && status !== 'loading') {
      return (
        <ScrollView
          contentContainerStyle={styles.centered}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
              tintColor={Colors.light.primary}
            />
          } // Allow refresh on empty screen
        >
          <Text style={styles.emptyText}>No saved items yet.</Text>
          <Text style={styles.emptySubText}>
            Save articles or words to find them here.
          </Text>
        </ScrollView>
      )
    }

    // Render the list if data exists
    return (
      <CustomFlatList
        flatListData={savedArticles}
        renderFlatListItem={renderSavedArticle}
        keyExtractor={item => item.id}
        containerStyle={styles.flatListContainer}
        contentContainerStyle={styles.listContent}
        numColumns={isDesktop ? 2 : 1}
        refreshControl={refreshControlElement}
        ListEmptyComponent={ListEmptyComponentContent}
        showScrollArrows={false}
        showScrollShadows={true}
      />
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Library' }} />
      <View style={styles.container}>{renderContent()}</View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  flatListContainer: { flex: 1 },
  listContent: { padding: 15 }, // Adjust padding for list
  itemContainer: {
    position: 'relative', // For positioning the unsave button
    marginBottom: 15,
    paddingHorizontal: 5 // Add horizontal padding if using numColumns > 1
  },
  unsaveButton: {
    position: 'absolute',
    top: 8,
    right: 8, // Adjust position as needed
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Make button visible
    padding: 6,
    borderRadius: 15,
    zIndex: 1 // Ensure it's above the card content
  },
  errorText: {
    color: Colors.light.error,
    marginBottom: 15,
    textAlign: 'center'
  },
  retryText: { color: Colors.light.primary, fontSize: 16, fontWeight: '500' },
  emptyText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 5
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    textAlign: 'center'
  },
  unknownItem: {
    padding: 15,
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  unknownText: { color: Colors.light.textSecondary },
  itemDetailMissing: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 8,
    minHeight: 100 // Ensure it has some height
  },
  itemDetailMissingText: {
    color: Colors.light.textSecondary,
    fontStyle: 'italic'
  }
})

const ListEmptyComponentContent = (
  <View style={styles.centered}>
    <Text style={styles.emptyText}>No saved items yet.</Text>
    <Text style={styles.emptySubText}>
      Save articles or words to find them here.
    </Text>
  </View>
)
