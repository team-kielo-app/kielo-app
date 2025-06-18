import React, { useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert
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
  selectHydratedSavedArticles
} from '@features/savedItems/savedItemsSlice'
import { useRefresh } from '@hooks/useRefresh'
import { Colors } from '@constants/Colors'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { XCircle, ArrowLeft, BookOpen } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import type { Article } from '@/features/articles/types'
import { CustomFlatList } from '@/components/common/CustomFlatList'

export default function LibraryScreen(): React.ReactElement {
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const savedArticles = useSelector(selectHydratedSavedArticles)
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const status = useSelector(selectSavedItemsStatus)
  const error = useSelector((state: RootState) => state.savedItems.error)

  const fetchData = useCallback(() => {
    return dispatch(fetchSavedItemsThunk())
  }, [dispatch])

  useEffect(() => {
    if (status === 'idle' || status === 'failed') {
      fetchData()
    }
  }, [dispatch, status, fetchData])

  const [isRefreshing, handleRefresh] = useRefresh(fetchData)

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(main)/(tabs)/')
    }
  }, [router])

  const handleUnsave = useCallback(
    async (itemType: string, itemId: string, itemTitle?: string) => {
      Alert.alert(
        'Confirm Unsave',
        `Are you sure you want to remove "${
          itemTitle || 'this item'
        }" from your library?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unsave',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(
                  unsaveItemThunk({ item_type: itemType, item_id: itemId })
                )
              } catch (err: any) {
                console.error('Unsave failed:', err)
                Alert.alert(
                  'Error',
                  err?.message || 'Could not remove item. Please try again.'
                )
              }
            }
          }
        ]
      )
    },
    [dispatch]
  )

  const renderSavedArticle = ({
    item
  }: {
    item: Article
  }): React.ReactElement => {
    return (
      <View
        style={
          isDesktop ? styles.itemContainerDesktop : styles.itemContainerMobile
        }
      >
        <ArticleCardWithThumbnail
          article={item}
          size={isDesktop ? 'medium' : 'small'}
        />
        <TouchableOpacity
          style={styles.unsaveButton}
          onPress={() => handleUnsave('ArticleVersion', item.id, item.title)}
          accessibilityLabel={`Unsave article ${item.title}`}
        >
          <XCircle size={isDesktop ? 24 : 22} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    )
  }

  const ListEmptyComponentContent = () => (
    <View style={styles.centeredMessageContainer}>
      <BookOpen
        size={48}
        color={Colors.light.textTertiary}
        style={{ marginBottom: 16 }}
      />
      <Text style={styles.emptyText}>No saved items yet.</Text>
      <Text style={styles.emptySubText}>
        Articles you save will appear here.
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push('/(main)/(tabs)/reader')}
      >
        <Text style={styles.browseButtonText}>Browse Articles</Text>
      </TouchableOpacity>
    </View>
  )

  const renderContent = () => {
    if (status === 'loading' && savedArticles.length === 0) {
      return (
        <View style={styles.centeredMessageContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )
    }
    if (status === 'failed' && savedArticles.length === 0 && error) {
      return (
        <View style={styles.centeredMessageContainer}>
          <Text style={styles.errorText}>Error loading saved items.</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )
    }

    const numColumns = isDesktop ? (Platform.OS === 'web' ? 4 : 3) : 1

    return (
      <CustomFlatList
        data={savedArticles}
        renderItem={renderSavedArticle}
        keyExtractor={item => item.id}
        containerStyle={styles.flatListContainer}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
          isDesktop && styles.listContentDesktop
        ]}
        numColumns={numColumns}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponentContent}
      />
    )
  }

  return (
    <>
      <Stack.Screen options={{ title: 'My Library' }} />
      <View style={styles.container}>
        {renderContent()}
        <TouchableOpacity
          style={[
            styles.floatingBackButton,
            { top: insets.top + (Platform.OS === 'ios' ? 10 : 15) }
          ]}
          onPress={handleGoBack}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary
  },
  centeredMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  flatListContainer: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: Platform.OS === 'web' ? 0 : 12,
    paddingTop: Platform.OS === 'ios' ? 55 : 65
  },
  listContentDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: 20
  },
  itemContainerMobile: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center'
  },
  itemContainerDesktop: {
    position: 'relative',
    flex: 1,
    margin: 8,
    maxWidth: '100%'
  },
  unsaveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.light.cardBackground + 'CC',
    padding: 8,
    borderRadius: 20,
    zIndex: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.error,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 17
  },
  errorSubText: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25
  },
  retryButtonText: {
    color: Colors.light.primaryContent,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold'
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textTertiary,
    textAlign: 'center',
    marginBottom: 20
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25
  },
  browseButtonText: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15
  },
  floatingBackButton: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground + 'E6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  }
})
