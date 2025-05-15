import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Article } from '@features/articles/types' // Your Article type
import { Colors } from '@constants/Colors'

interface ArticleMetadataDisplayProps {
  article: Article | null | undefined // The full article object or relevant parts
  publicationDateFormatted: string
  onBrandPress: () => void
  isDesktop?: boolean // Optional for styling differences
}

export const ArticleMetadataDisplay: React.FC<ArticleMetadataDisplayProps> = ({
  article,
  publicationDateFormatted,
  onBrandPress,
  isDesktop = false
}) => {
  if (!article) {
    // Or render a skeleton/placeholder if article is loading
    return null
  }

  return (
    <>
      <View style={styles.articleMetadata}>
        {article.category && (
          <Text style={styles.articleCategory}>
            {article.category.toUpperCase()}
          </Text>
        )}
        {/* Date was previously here, but publicationDateFormatted is more complete */}
      </View>
      <Text
        style={[styles.articleTitle, isDesktop && styles.desktopArticleTitle]}
      >
        {article.title}
      </Text>
      {article.subtitle && (
        <Text
          style={[
            styles.articleSubtitle,
            isDesktop && styles.desktopArticleSubtitle
          ]}
        >
          {article.subtitle}
        </Text>
      )}

      {/* Tags Container */}
      {article.tags && article.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {article.tags.map(tag => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      )}

      {/* Meta Container: Brand and Full Date */}
      <View style={styles.metaContainer}>
        {article.brand?.display_name && (
          <Pressable onPress={onBrandPress} hitSlop={10}>
            <Text style={styles.brand}>{article.brand.display_name}</Text>
          </Pressable>
        )}
        {publicationDateFormatted && (
          <Text style={styles.date}>{publicationDateFormatted}</Text>
        )}
      </View>
    </>
  )
}

// Styles are copied and adapted from ArticleScreen.tsx
const styles = StyleSheet.create({
  articleMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Or 'flex-start' if only category is present
    alignItems: 'center',
    marginBottom: 12
    // marginTop: 10, // This was in ArticleScreen, will be part of the parent's layout
  },
  articleCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.primary
  },
  articleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24, // Mobile default
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 32
  },
  desktopArticleTitle: {
    fontSize: 28, // Larger for desktop
    lineHeight: 36
  },
  articleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16, // Mobile default
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 24
  },
  desktopArticleSubtitle: {
    fontSize: 18, // Larger for desktop
    lineHeight: 28
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 6
  },
  tag: {
    backgroundColor: Colors.light.backgroundLight,
    color: Colors.light.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: 'Inter-Medium'
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Or adjust as needed before audio player/paragraphs
    gap: 10,
    flexWrap: 'wrap' // Allow wrapping if brand + date is too long
  },
  brand: {
    fontSize: 15,
    // paddingVertical: 8, // Removed for cleaner alignment with date
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  }
})
