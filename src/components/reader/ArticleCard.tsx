import React, { useMemo, useState } from 'react'
import type { ArticleType } from '@features/articles/types'
import { Colors } from '@constants/Colors'
import { Link } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity
} from 'react-native'
import { Article } from '@features/articles/types' // Use the new Article typeate formatting
import { BookOpen } from 'lucide-react-native'
import { formatDistanceToNow } from 'date-fns'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

type ArticleCardProps = {
  article: ArticleType
  onPress: () => void
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onPress
}) => {
  const { isDesktop } = useResponsiveDimensions()
  const [isSaved, setIsSaved] = useState(false)

  const formattedDate = useMemo(() => {
    if (!article?.publication_date) return ''
    return formatDistanceToNow(new Date(article?.publication_date))
  }, [article?.publication_date])

  const toggleSaved = (e: any) => {
    e.stopPropagation()
    setIsSaved(!isSaved)
  }

  const handleBrandPress = () => {
    console.log(
      'Navigate to brand page for:',
      article?.brand?.source_identifier
    )
    // Future implementation:
    // router.push({
    //   pathname: '/(main)/brand/[id]',
    //   params: { id: article.brand.source_identifier }
    // });
    // For now, maybe just log or do nothing
  }

  return (
    <TouchableOpacity
      style={[styles.card]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Optional: Bookmark Icon */}
      <View style={styles.bookmarkIconContainer}>
        <BookOpen size={18} color={Colors.light.textTertiary} />
        {/* Or use a bookmark icon based on article.isBookmarked */}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={3}>
          {article?.title}
        </Text>

        {/* Brand Info & Date */}
        <View style={styles.footer}>
          <Pressable onPress={handleBrandPress} hitSlop={10}>
            <Text style={styles.brandName}>{article?.brand?.display_name}</Text>
          </Pressable>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Optional: Progress Bar if tracking reading */}
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${Math.random() * 100}%` }]}
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: 12,
    marginBottom: 15,
    // Common card styles (shadow, border etc)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border,
    overflow: 'hidden', // Needed for progress bar potentially
    minHeight: 120, // Adjust as needed
    padding: 12,
    position: 'relative' // For absolute positioning of icon
  },
  bookmarkIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4, // Hit area
    // backgroundColor: 'rgba(255,255,255,0.7)', // Optional background
    borderRadius: 15
  },
  content: {
    flex: 1,
    justifyContent: 'space-between' // Push title up and footer down
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold', // Or your title font
    color: Colors.light.text,
    marginBottom: 10,
    lineHeight: 22,
    paddingRight: 25 // Avoid overlapping icon
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto' // Push footer to bottom
  },
  brandName: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary, // Or use brand color if desired/safe
    paddingVertical: 2 // Hit area for Pressable
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  // Optional progress bar styling
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2
  }
})
