import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import type { Article as ArticleType } from '@features/articles/types'
import { Colors } from '@constants/Colors'
import { Bookmark, BookmarkCheck } from 'lucide-react-native'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'
import { formatDistanceToNowStrict } from 'date-fns'
import { ArticleThumbnail } from './ArticleThumbnail'

interface ArticleCardWithThumbnailProps {
  article: ArticleType
  size?: 'small' | 'medium' | 'large'
}

export function ArticleCardWithThumbnail({
  article,
  size = 'small'
}: ArticleCardWithThumbnailProps): React.ReactElement {
  const router = useRouter()
  const { isDesktop } = useResponsiveDimensions()
  const [isLocallySaved, setIsLocallySaved] = React.useState(false)

  const cardDimensions = useMemo(() => {
    let width = 220
    let imageHeight = 140
    if (size === 'medium') {
      width = isDesktop ? 280 : 240
      imageHeight = isDesktop ? 180 : 150
    } else if (size === 'large') {
      width = isDesktop ? 340 : 260
      imageHeight = isDesktop ? 220 : 170
    }
    return { width, imageHeight }
  }, [size, isDesktop])

  const handlePress = () => {
    router.push({ pathname: '/(main)/reader/[id]', params: { id: article.id } })
  }

  const handleToggleSave = (e: any) => {
    e.stopPropagation()
    setIsLocallySaved(!isLocallySaved)
    Alert.alert(
      'Save Action',
      isLocallySaved ? 'Unsaced (mock)' : 'Saved (mock)'
    )
  }

  const formattedDate = useMemo(() => {
    if (!article?.publication_date) return ''
    return formatDistanceToNowStrict(new Date(article.publication_date), {
      addSuffix: true
    })
  }, [article?.publication_date])

  return (
    <TouchableOpacity
      style={[styles.shadowContainer, { width: cardDimensions.width }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.cardContentWrapper}>
        <View
          style={[
            styles.imageOuterContainer,
            { height: cardDimensions.imageHeight }
          ]}
        >
          <ArticleThumbnail
            article={article}
            style={styles.imageFill}
            containerStyle={styles.thumbnailContainerStyle}
            size={
              size === 'small'
                ? 'thumb'
                : size === 'medium'
                ? 'medium'
                : 'large'
            }
            contentFit="cover"
          />
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={handleToggleSave}
          >
            {isLocallySaved ? (
              <BookmarkCheck
                size={20}
                color={Colors.light.primary}
                fill={Colors.light.primaryLight}
              />
            ) : (
              <Bookmark size={20} color={Colors.light.primaryContent} />
            )}
          </TouchableOpacity>
          {article?.tags && article.tags.length > 0 && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {article.tags[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textContextContainer}>
          <Text style={styles.title} numberOfLines={size === 'small' ? 2 : 3}>
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
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  shadowContainer: {
    borderRadius: 12,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle,
    flex: 1
  },
  cardContentWrapper: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1
  },
  imageOuterContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: Colors.light.backgroundSecondary
  },
  thumbnailContainerStyle: {},
  imageFill: {
    width: '100%',
    height: '100%'
  },
  bookmarkButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 1,
    maxWidth: '70%'
  },
  categoryText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: Colors.light.primaryContent,
    textTransform: 'uppercase'
  },
  textContextContainer: {
    padding: 12
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 20
  },
  metaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
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
    marginHorizontal: 5
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: Colors.light.textSecondary,
    flexShrink: 1
  }
})
