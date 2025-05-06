// ArticleCardWithThumbnail.tsx (or similar name)

import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
  // Image, // Remove Image import
  // ActivityIndicator // Remove ActivityIndicator if handled by ArticleThumbnail
} from 'react-native'
import { useRouter } from 'expo-router'
import type { Article as ArticleType } from '@features/articles/types' // Use Article type alias
import { Colors } from '@constants/Colors'
import { Bookmark, BookmarkCheck } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions' // Adjust path
import { formatDistanceToNow } from 'date-fns'
// Removed MediaMetadata import if not used directly
import { ArticleThumbnail } from './ArticleThumbnail' // <<< Import the component

// Props remain similar, relying on ArticleType having the thumbnail object
type ArticleCardWithThumbnailProps = {
  article: ArticleType
  size?: 'small' | 'medium' | 'large'
}

export const ArticleCardWithThumbnail: React.FC<
  ArticleCardWithThumbnailProps
> = ({
  article,
  size = 'small' // Default size for the card itself
}) => {
  const router = useRouter()
  const { isDesktop } = useResponsiveDimensions()
  const [isSaved, setIsSaved] = useState(false) // Use useState for saved state

  // Determine overall card dimensions based on size prop and desktop status
  const cardDimensions = useMemo(() => {
    let width = 240 // Default small width
    let height = 160 // Default small aspect ratio (approximated)

    if (size === 'medium') {
      width = isDesktop ? 300 : 240
      height = isDesktop ? 200 : 160
    } else if (size === 'large') {
      width = isDesktop ? 360 : 280
      height = isDesktop ? 240 : 180
    }
    return { width, height } // Height is mainly for the image container
  }, [size, isDesktop])

  const handlePress = () => {
    // Navigate to the reader screen using the article ID
    router.push({
      pathname: '/(main)/reader/[id]',
      params: { id: article.id }
    })
  }

  const toggleSaved = (e: any) => {
    e.stopPropagation() // Prevent article navigation
    setIsSaved(!isSaved)
    // TODO: Implement actual save/unsave Redux action here
  }

  // Formatted date calculation remains the same
  const formattedDate = useMemo(() => {
    if (!article?.publication_date) return ''
    return formatDistanceToNow(new Date(article.publication_date), {
      addSuffix: true
    })
  }, [article?.publication_date])

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: cardDimensions.width,
          marginRight: 12,
          marginBottom: isDesktop ? 16 : 0
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { height: cardDimensions.height }]}>
        {/* --- Use ArticleThumbnail --- */}
        <ArticleThumbnail
          article={article} // Pass the whole article object
          style={styles.image} // Apply style to fill the container
          size={size === 'small' ? 'thumb' : 'medium'} // Choose appropriate thumbnail size variant
          contentFit="cover" // Cover for card thumbnails usually looks best
        />
        {/* --- End ArticleThumbnail Usage --- */}

        {/* Bookmark Button */}
        <TouchableOpacity style={styles.bookmarkButton} onPress={toggleSaved}>
          {isSaved ? (
            <BookmarkCheck size={20} color={Colors.light.primary} />
          ) : (
            <Bookmark size={20} color={Colors.light.white} />
          )}
        </TouchableOpacity>

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          {article?.tags && article?.tags.length > 0 && (
            <Text
              key={article.tags[0]}
              style={styles.categoryText}
              numberOfLines={1}
            >
              {article.tags[0]}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <View style={styles.metaLine}>
          {article?.brand?.display_name && (
            <Text style={styles.brandText} numberOfLines={1}>
              {article.brand.display_name}
            </Text>
          )}
          {article?.brand?.display_name && formattedDate && (
            <Text style={styles.metaSeparator}>•</Text>
          )}
          {formattedDate && (
            <Text style={styles.dateText} numberOfLines={1}>
              {formattedDate}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Styles remain largely the same, removed placeholder/LQIP-specific styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    // Height set dynamically by cardDimensions
    backgroundColor: Colors.light.backgroundLight // BG color for the container itself
  },
  image: {
    // These ensure ArticleThumbnail fills the container
    width: '100%',
    height: '100%'
  },
  // Removed placeholder, placeholderLqip, placeholderText styles
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
    maxWidth: '70%'
  },
  categoryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.white,
    textTransform: 'uppercase'
  },
  contentContainer: {
    padding: 12,
    flex: 1 // Allow content to potentially influence height if needed
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.primary,
    flexShrink: 1
  },
  metaSeparator: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginHorizontal: 4
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
    flexShrink: 1
  }
})
