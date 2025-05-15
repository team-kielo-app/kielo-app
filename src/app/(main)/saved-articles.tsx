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
  selectAllSavedItems,
  selectSavedItemsStatus
} from '@features/savedItems/savedItemsSlice'
import { SavedItem, BaseWordSnippet } from '@features/savedItems/types'
import { useRefresh } from '@hooks/useRefresh'
import { Colors } from '@constants/Colors'
import { showAuthDebugToast } from '@lib/debugToast'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { XCircle } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

export default function LibraryScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const savedItems = useSelector(selectAllSavedItems)
  const status = useSelector(selectSavedItemsStatus)
  const error = useSelector((state: RootState) => state.savedItems.error) // Get error state

  // --- Initial Fetch & Refetch on Focus ---
  // Using useEffect for simplicity, consider useFocusEffect for real navigation
  useEffect(() => {
    // Fetch only if idle or if data is empty (e.g., after logout/clear)
    if (status === 'idle') {
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
  const renderSavedItem = useCallback(
    ({ item }: { item: SavedItem }) => {
      // Type narrowing for item_details is now handled by discriminated union
      if (item.item_type === 'ArticleVersion') {
        // item is now inferred as SavedArticleItem
        return (
          <View style={styles.itemContainer}>
            {item.item_details && ( // Check if details exist
              <ArticleCardWithThumbnail
                article={item.item_details} // No 'as any' needed
                size="small"
              />
            )}
            {/* Consider a placeholder or message if item.item_details is null/undefined */}
            {!item.item_details && (
              <View style={styles.itemDetailMissing}>
                <Text style={styles.itemDetailMissingText}>
                  Article details loading or unavailable.
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.unsaveButton}
              onPress={() => handleUnsave(item.item_type, item.item_id)}
            >
              <XCircle size={22} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        )
      }
      // Example for BaseWord
      else if (item.item_type === 'BaseWord') {
        // item is now inferred as SavedBaseWordItem
        // You would render a specific WordCard component here
        return (
          <View style={[styles.itemContainer, styles.unknownItem]}>
            {item.item_details && (
              <Text style={styles.unknownText}>
                Word: {item.item_details.word_fi} (
                {item.item_details.basic_definition_en || 'No definition'})
              </Text>
            )}
            {!item.item_details && (
              <Text style={styles.unknownText}>Word details missing.</Text>
            )}
            <TouchableOpacity
              style={styles.unsaveButton}
              onPress={() => handleUnsave(item.item_type, item.item_id)}
            >
              <XCircle size={22} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        )
      }
    },
    [
      handleUnsave,
      styles.itemContainer,
      styles.unsaveButton,
      styles.unknownItem,
      styles.unknownText,
      styles.itemDetailMissing,
      styles.itemDetailMissingText
    ]
  )

  // --- Loading / Error / Empty States ---
  const renderContent = () => {
    if (status === 'loading' && savedItems.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )
    }
    if (status === 'failed' && savedItems.length === 0) {
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
    if (savedItems.length === 0 && status !== 'loading') {
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
      <FlatList
        data={savedItems}
        renderItem={renderSavedItem}
        keyExtractor={item => `${item.item_type}-${item.item_id}`}
        contentContainerStyle={styles.listContent}
        numColumns={isDesktop ? 2 : 1} // Example responsive layout
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]} // Android
            tintColor={Colors.light.primary} // iOS
          />
        }
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
