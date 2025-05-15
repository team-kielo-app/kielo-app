import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native'
import { Link } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { Article } from '@features/articles/types' // Your Article type
import { PaginationStateType } from '@pagination/types' // Your PaginationStateType

interface FeaturedArticlesProps {
  articles: Article[]
  pagination: PaginationStateType // Pass the relevant pagination state
  // Potentially add onEndReached, onRefresh if this component manages its own fetching,
  // but for now, assuming HomeScreen passes data.
}

export const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({
  articles,
  pagination
}) => {
  const showArticleLoading = pagination.isLoading && articles.length === 0

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Articles</Text>
        <Link href="/(main)/(tabs)/reader" asChild>
          <TouchableOpacity
            style={styles.seeAllButton}
            accessibilityRole="link"
            accessibilityLabel="See all articles"
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </Link>
      </View>

      {showArticleLoading ? (
        <View style={styles.centeredSection}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={item => item.id}
          horizontal
          // showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <ArticleCardWithThumbnail article={item} size="medium" /> // Example size
          )}
          ListEmptyComponent={
            pagination.isLoading ? null : ( // Don't show empty if still loading more
              <Text style={styles.emptyText}>No featured articles found.</Text>
            )
          }
          contentContainerStyle={styles.articleList}
          style={{ marginTop: 16 }}
          // If this component handles its own pagination fetching in the future:
          // onEndReached={onEndReached}
          // onEndReachedThreshold={0.5}
          // ListFooterComponent={pagination.isLoadingMore ? <ActivityIndicator /> : null}
        />
      )}
    </View>
  )
}

// Styles copied and adapted from HomeScreen
const styles = StyleSheet.create({
  section: {
    marginBottom: 28
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 2
  },
  centeredSection: {
    height: 150, // Or adjust based on ArticleCardWithThumbnail height
    justifyContent: 'center',
    alignItems: 'center'
  },
  articleList: {
    paddingRight: 20, // Ensures last item isn't cut off visually
    gap: 12 // Add gap between cards
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    width: 250, // Give some width to the empty message container
    paddingVertical: 50 // Make it visible
  }
})
