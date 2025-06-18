import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  Alert
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Search, PlusCircle } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleCard } from '@/components/reader/ArticleCard'
import { useRouter } from 'expo-router'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { useSelector, useDispatch } from 'react-redux'
import { fetchArticles } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectUser } from '@features/auth/authSelectors'
import { selectPaginatedData } from '@pagination/selectors'
import { useRefresh } from '@hooks/useRefresh'
import { Article } from '@features/articles/types'
import { LinearGradient } from 'expo-linear-gradient'

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'news', name: 'News' },
  { id: 'culture', name: 'Culture' },
  { id: 'sports', name: 'Sports' },
  { id: 'science', name: 'Science' },
  { id: 'technology', name: 'Technology' }
]

const ARTICLES_PAGINATION_KEY = (
  userId?: string,
  categoryId: string = 'all',
  searchQuery: string = ''
) => {
  const userPrefix = userId ? `user-${userId}` : 'public'
  const categorySuffix = categoryId === 'all' ? '' : `-cat-${categoryId}`
  const searchSuffix = searchQuery
    ? `-search-${encodeURIComponent(searchQuery.substring(0, 15))}`
    : ''
  return `${userPrefix}-articles-feed${categorySuffix}${searchSuffix}`
}

export default function ReaderScreen(): React.ReactElement {
  const router = useRouter()
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => selectUser(state))
  const insets = useSafeAreaInsets()
  const tabBarHeight = 70 + 15 + insets.bottom

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<TextInput>(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const currentPaginationKey = ARTICLES_PAGINATION_KEY(
    user?.id,
    selectedCategory,
    debouncedSearchQuery
  )

  const { data: articles, pagination } = useSelector((state: RootState) =>
    selectPaginatedData(
      'articles',
      'articlePagination',
      currentPaginationKey,
      false
    )(state)
  )

  const fetchArticlesList = useCallback(
    (options?: { reset?: boolean; fetchNext?: boolean }) => {
      let queryParams: Record<string, any> = {}
      if (selectedCategory !== 'all') {
        queryParams.category = selectedCategory
      }
      if (debouncedSearchQuery) {
        queryParams.q = debouncedSearchQuery
      }
      dispatch(
        fetchArticles(currentPaginationKey, {
          ...options,
          additionalQueryParams: queryParams
        })
      )
    },
    [dispatch, currentPaginationKey, selectedCategory, debouncedSearchQuery]
  )

  useEffect(() => {
    if (!pagination.isLoading && !pagination.hasFetched) {
      fetchArticlesList({ reset: true })
    }
  }, [fetchArticlesList, pagination.isLoading, pagination.hasFetched])

  const [isRefreshing, handleRefresh] = useRefresh(async () => {
    await fetchArticlesList({ reset: true, forceRefresh: true })
  })

  const handleLoadMore = () => {
    if (!pagination.isLoading && pagination.hasMore) {
      fetchArticlesList({ fetchNext: true })
    }
  }

  const handleAddArticle = () => {
    Alert.alert(
      'Add Article',
      'Feature to add new articles is not yet implemented.'
    )
  }

  const renderFooter = () => {
    if (!pagination.isLoading && !pagination.hasMore && articles.length > 0) {
      return <Text style={styles.listEndText}>No more articles.</Text>
    }
    if (pagination.isLoading && articles.length > 0) {
      return (
        <ActivityIndicator
          style={{ marginVertical: 20 }}
          color={Colors.light.primary}
        />
      )
    }
    return null
  }

  return (
    <LinearGradient
      colors={[Colors.common.white, Colors.light.backgroundSecondary]}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reader</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddArticle}
          >
            <PlusCircle size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              isSearchFocused && styles.searchInputFocused
            ]}
          >
            <Search size={20} color={Colors.light.textTertiary} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search articles..."
              placeholderTextColor={Colors.light.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              // onFocus={() => setIsSearchFocused(true)}
              // onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              onSubmitEditing={() => fetchArticlesList({ reset: true })}
            />
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id &&
                    styles.categoryButtonActive
                ]}
                onPress={() => {
                  setSelectedCategory(category.id)
                }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id &&
                      styles.categoryButtonTextActive
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {pagination.isLoading && articles.length === 0 ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ArticleCard
                article={item}
                onPress={() => router.push(`/(main)/reader/${item.id}`)}
              />
            )}
            contentContainerStyle={[
              styles.articlesContainer,
              isDesktop && styles.wideScreenArticlesContainer,
              { paddingBottom: tabBarHeight + 20 }
            ]}
            ListEmptyComponent={
              !pagination.isLoading && articles.length === 0 ? (
                <Text style={styles.emptyText}>
                  No articles found for "{selectedCategory}"{' '}
                  {debouncedSearchQuery
                    ? `matching "${debouncedSearchQuery}"`
                    : ''}
                  .
                </Text>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.light.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.background
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: Colors.light.text
  },
  headerButton: {
    padding: 6
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.light.background
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackgroundSubtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    borderColor: Colors.light.borderSubtle
  },
  searchInputFocused: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: Colors.light.text
  },
  categoriesContainer: {
    paddingVertical: 8,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    marginBottom: 8
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackgroundSubtle,
    borderWidth: 1,
    borderColor: Colors.light.borderSubtle
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.light.textSecondary
  },
  categoryButtonTextActive: {
    color: Colors.light.primaryContent,
    fontFamily: 'Inter-SemiBold'
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  wideScreenArticlesContainer: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%'
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.light.textSecondary,
    paddingHorizontal: 40,
    fontSize: 15,
    fontFamily: 'Inter-Regular'
  },
  listEndText: {
    textAlign: 'center',
    color: Colors.light.textTertiary,
    paddingVertical: 20,
    fontFamily: 'Inter-Regular'
  }
})
