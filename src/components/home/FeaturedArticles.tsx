import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Link } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleCardWithThumbnail } from '@components/reader/ArticleCardWithThumbnail'
import { CustomFlatList } from '@/components/common/CustomFlatList'
import { Article } from '@features/articles/types'
import { PaginationStateType } from '@pagination/types'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { ArticleCardWithThumbnailSkeleton } from '@/components/skeletons/ArticleCardWithThumbnailSkeleton'

interface FeaturedArticlesProps {
  articles: Article[]
  pagination: PaginationStateType
  onLoadMore?: () => void
  title?: string
  viewAllPath?: string
}

const NUM_SKELETONS_INITIAL = 3

export function FeaturedArticles({
  articles,
  pagination,
  onLoadMore,
  title = 'Featured Articles',
  viewAllPath = '/(main)/(tabs)/reader'
}: FeaturedArticlesProps): React.ReactElement | null {
  const { isMobile } = useResponsiveDimensions()

  const showInitialLoadingSkeleton =
    pagination.isLoading && articles.length === 0 && !pagination.error
  const showLoadMoreSkeleton =
    pagination.isLoading && articles.length > 0 && pagination.hasMore

  const renderItem = ({ item }: { item: Article }) => (
    <ArticleCardWithThumbnail
      article={item}
      size={isMobile ? 'small' : 'medium'}
    />
  )

  const renderSkeletonItem = (keySuffix: string | number) => (
    <View key={`skeleton-${keySuffix}`}>
      <ArticleCardWithThumbnailSkeleton size={isMobile ? 'small' : 'medium'} />
    </View>
  )

  if (pagination.error && articles.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.errorText}>
          Could not load {title.toLowerCase()}. Please try again later.
        </Text>
      </View>
    )
  }

  if (
    !showInitialLoadingSkeleton &&
    articles.length === 0 &&
    !pagination.error
  ) {
    return null
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {(!showInitialLoadingSkeleton || articles.length > 0) && (
          <Link href={viewAllPath as any} asChild>
            <TouchableOpacity
              style={styles.seeAllButton}
              accessibilityRole="link"
              accessibilityLabel={`See all ${title.toLowerCase()}`}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <ChevronRight size={16} color={Colors.common.gray[500]} />
            </TouchableOpacity>
          </Link>
        )}
      </View>

      {showInitialLoadingSkeleton ? (
        <View style={styles.skeletonContainer}>
          {Array.from({ length: NUM_SKELETONS_INITIAL }).map((_, index) =>
            renderSkeletonItem(`initial-${index}`)
          )}
        </View>
      ) : (
        <CustomFlatList
          horizontal
          data={articles}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator
          showScrollShadows={false}
          onEndReached={onLoadMore}
          onEndReachedThreshold={1}
          ListFooterComponent={
            showLoadMoreSkeleton ? renderSkeletonItem('footer-loading') : null
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    fontSize: 20
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.common.gray[500],
    marginRight: 2
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingLeft: 2,
    paddingVertical: 4
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
