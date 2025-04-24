import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, Plus } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleCard } from '@/components/reader/ArticleCard' // Assuming component exists
import { useRouter } from 'expo-router'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { useSelector, useDispatch } from 'react-redux'
import { fetchArticles } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectIsAuthenticated, selectUser } from '@features/auth/authSelectors'
import { selectPaginatedData } from '@pagination/selectors'

// Filled from original file
const CATEGORIES = [
  { id: 'news', name: 'News' },
  { id: 'culture', name: 'Culture' },
  { id: 'sports', name: 'Sports' },
  { id: 'science', name: 'Science' },
  { id: 'technology', name: 'Technology' }
]

export default function ReaderScreen() {
  const router = useRouter()
  const { isDesktop } = useResponsiveDimensions()
  const dispatch = useDispatch<AppDispatch>()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userState = useSelector((state: RootState) => selectUser(state))

  const paginationKey = isAuthenticated
    ? `${userState?.id}-articles-feed`
    : 'articlesPublic'
  const { data: articles, pagination } = useSelector((state: RootState) =>
    selectPaginatedData(
      'articles',
      'articlePagination',
      paginationKey,
      true
    )(state)
  )

  // Fetch initial articles
  useEffect(() => {
    if (!pagination.isLoading && !pagination.error && articles.length < 5) {
      dispatch(fetchArticles(paginationKey, { reset: true }))
    }
  }, [dispatch, userState?.id, articles.length])

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef(null)

  const filteredArticles = articles.filter(article => {
    // Handle potential missing category property gracefully
    const articleCategoryLower = article.category?.toLowerCase() || ''
    const selectedCategoryLower = selectedCategory.toLowerCase()

    const matchesCategory =
      selectedCategoryLower === 'all' ||
      articleCategoryLower === selectedCategoryLower
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.subtitle &&
        article.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) // Check if subtitle exists

    return matchesCategory && matchesSearch
  })

  const handleAddArticle = () => {
    // TODO: Implement navigation or modal for adding articles
    alert('Add article feature not implemented.')
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reader</Text>
        <View style={styles.headerRightButtons}>
          {/* TODO: Add guard if adding requires auth */}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleAddArticle}
          >
            <Plus size={22} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            isSearchFocused && styles.searchInputFocused
          ]}
        >
          <Search size={20} color={Colors.light.textSecondary} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.categoryButtonTextActive
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
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

      {/* Articles List */}
      {pagination.isLoading && articles.length === 0 ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={Colors.light.primary}
        />
      ) : (
        <FlatList
          data={filteredArticles}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              // Navigate to article detail within main group
              onPress={() => router.push(`/(main)/article/${item.id}`)}
            />
          )}
          contentContainerStyle={[
            styles.articlesContainer,
            isDesktop && styles.wideScreenArticlesContainer
          ]}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No articles found matching your criteria.
            </Text>
          }
          // TODO: Add onEndReached for pagination
          // onEndReached={() => dispatch(fetchArticles(userState?.id))}
          // onEndReachedThreshold={0.5}
          // ListFooterComponent={pagination.isLoading ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
        />
      )}
    </SafeAreaView>
  )
}

// Styles filled from original file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text
  },
  headerRightButtons: {
    flexDirection: 'row'
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'transparent', // Default no border
    shadowColor: Colors.light.shadow, // Subtle shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  searchInputFocused: {
    borderColor: Colors.light.primary
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    outlineStyle: 'none'
  },
  categoriesContainer: {
    marginBottom: 16
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8 // Add gap between buttons
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.cardBackground,
    // marginHorizontal: 4, // Use gap instead
    borderWidth: 1, // Add border for definition
    borderColor: Colors.light.border
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary // Match border color
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  categoryButtonTextActive: {
    color: Colors.light.white
  },
  articlesContainer: {
    paddingHorizontal: 20, // Ensure padding for list items
    paddingBottom: 20 // Add padding at the bottom
    // paddingTop: 8, // Removed, header provides spacing
  },
  wideScreenArticlesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: "space-between", // Let items flow with padding
    gap: 16, // Use gap for spacing between cards
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20 // Apply consistent padding
  },
  loader: { marginTop: 50 },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: Colors.light.textSecondary,
    paddingHorizontal: 40
  }
})
