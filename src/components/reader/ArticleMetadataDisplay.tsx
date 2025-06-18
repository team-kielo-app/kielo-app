import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Article } from '@features/articles/types'
import { Colors } from '@constants/Colors'

interface ArticleMetadataDisplayProps {
  article: Article | null | undefined
  publicationDateFormatted: string
  onBrandPress: () => void
  isDesktop?: boolean
}

export function ArticleMetadataDisplay({
  article,
  publicationDateFormatted,
  onBrandPress,
  isDesktop = false
}: ArticleMetadataDisplayProps): React.ReactElement | null {
  if (!article) {
    return null
  }

  const displayCategory =
    article.category && article.tags?.includes(article.category)

  return (
    <View style={styles.metaDisplayContainer}>
      {displayCategory && (
        <Text style={styles.articleCategoryText}>
          {article.category?.toUpperCase()}
        </Text>
      )}
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

      {article.tags && article.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {article.tags.map(tag => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bylineContainer}>
        {article.brand?.display_name && (
          <Pressable
            onPress={onBrandPress}
            hitSlop={10}
            style={styles.brandPressable}
          >
            <Text style={styles.brandText}>{article.brand.display_name}</Text>
          </Pressable>
        )}
        {article.brand?.display_name && publicationDateFormatted && (
          <Text style={styles.bylineSeparator}>•</Text>
        )}
        {publicationDateFormatted && (
          <Text style={styles.dateText}>{publicationDateFormatted}</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  metaDisplayContainer: {},
  articleCategoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
    color: Colors.light.primary,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  articleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 34
  },
  desktopArticleTitle: {
    fontSize: 30,
    lineHeight: 38
  },
  articleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 25
  },
  desktopArticleSubtitle: {
    fontSize: 19,
    lineHeight: 28
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8
  },
  tagChip: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.textSecondary
  },
  bylineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 6
  },
  brandPressable: {},
  brandText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary
  },
  bylineSeparator: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textTertiary,
    paddingHorizontal: 2
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  }
})
