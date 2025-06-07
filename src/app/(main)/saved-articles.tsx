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
import { Stack, useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchSavedItemsThunk,
  unsaveItemThunk
} from '@features/savedItems/savedItemsActions'
import {
  selectSavedItemsStatus,
  selectHydratedSavedArticles,
  selectSavedItemReferences
} from '@features/savedItems/savedItemsSlice'
import { useRefresh } from '@hooks/useRefresh'
import { Colors } from '@constants/Colors'
import { showAuthDebugToast } from '@lib/debugToast'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { XCircle, ArrowLeft } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import type { Article } from '@/features/articles/types'
import { CustomFlatList } from '@/components/common/CustomFlatList'

export default function LibraryScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const savedArticles = useSelector(selectHydratedSavedArticles)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const status = useSelector(selectSavedItemsStatus)
  const error = useSelector((state: RootState) => state.savedItems.error)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSavedItemsThunk())
    }
  }, [dispatch, status])

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(main)/(tabs)/') // Fallback to home if no back history
    }
  }, [router])

  const handleRefreshAction = useCallback(() => {
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

  const handleLoadMore = useCallback(() => {
    // Check if currently loading, if already at the end, or if status is not 'succeeded'
    // This logic depends on how your pagination state from savedItemsSlice or a dedicated pagination slice for it looks
    // For now, assuming fetchSavedItemsThunk can handle fetching "next page" if it were designed for it.
    // If fetchSavedItemsThunk always resets, you'd need a different thunk for "load more".

    // Let's assume your `fetchSavedItemsThunk` is currently for initial/refresh.
    // For "load more", you'd typically have:
    // 1. Pagination state in Redux for saved items (nextPageKey, isLoadingMore, etc.)
    // 2. A `fetchMoreSavedItemsThunk`
    // For now, this is a placeholder:
    if (status === 'succeeded' && !isRefreshing /* && hasMoreSavedItems */) {
      console.log('LibraryScreen: Load more triggered...')
      // dispatch(fetchMoreSavedItemsThunk()); // Hypothetical thunk
    }
  }, [status, isRefreshing, dispatch /*, hasMoreSavedItems */])

  const handleUnsave = useCallback(
    async (itemType: string, itemId: string) => {
      showAuthDebugToast('info', `Unsacing ${itemType} ${itemId}...`)
      try {
        await dispatch(
          unsaveItemThunk({ item_type: itemType, item_id: itemId })
        )
        showAuthDebugToast('success', 'Item Unsaved')
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

  const renderSavedArticle = ({ item }: { item: Article }) => {
    return (
      <View style={styles.itemContainer}>
        <ArticleCardWithThumbnail article={item} size="small" />
        <TouchableOpacity
          style={styles.unsaveButton}
          onPress={() => handleUnsave('ArticleVersion', item.id)}
        >
          <XCircle size={22} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    )
  }

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
          }
        >
          <Text style={styles.emptyText}>No saved items yet.</Text>
          <Text style={styles.emptySubText}>
            Save articles or words to find them here.
          </Text>
        </ScrollView>
      )
    }

    return (
      <CustomFlatList
        data={savedArticles}
        renderItem={renderSavedArticle}
        keyExtractor={item => item.id}
        containerStyle={styles.flatListContainer}
        contentContainerStyle={styles.listContent}
        numColumns={isDesktop ? 3 : 1}
        refreshControl={refreshControlElement}
        ListEmptyComponent={ListEmptyComponentContent}
        showScrollArrows={false}
        showScrollShadows={true}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5} // Adjust as needed
        ListFooterComponent={() => {
          // Render a loading indicator if status indicates loading more
          if (status === 'loading')
            return <ActivityIndicator style={{ marginVertical: 20 }} />
          return null
        }}
      />
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Library' }} />
      <View style={styles.container}>
        {renderContent()}

        {/* Floating Back Button - similar to reader screen's style */}
        {/* Position it respecting safe area, typically top-left */}
        <TouchableOpacity
          style={[styles.floatingBackButton, { top: insets.top + 10 }]} // Adjust top offset as needed
          onPress={handleGoBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color={Colors.light.text} />
          {/* Color can be white if on a dark background, or theme text color */}
        </TouchableOpacity>
      </View>
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
  listContent: { padding: 15 },
  itemContainer: {
    position: 'relative',
    marginBottom: 15,
    paddingHorizontal: 5
  },
  unsaveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 6,
    borderRadius: 15,
    zIndex: 1
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
    minHeight: 100
  },
  itemDetailMissingText: {
    color: Colors.light.textSecondary,
    fontStyle: 'italic'
  },
  floatingBackButton: {
    position: 'absolute',
    // top: is handled by insets + offset
    left: 15,
    zIndex: 10, // Ensure it's above other content
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
    // Or use Colors.light.cardBackground with opacity if preferred
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3 // Android shadow
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
