import React, { useMemo } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Image as ExpoImage, ImageStyle } from 'expo-image'

import { Article } from '@features/articles/types'
import { MediaMetadata } from '@features/media/types'
import { getBestImageUrl, getStaticPreviewUrl } from '@lib/mediaUtils'
import { Colors } from '@constants/Colors'
import { ImageOff } from 'lucide-react-native'

interface ArticleThumbnailProps {
  article: Article | null | undefined
  style?: ImageStyle
  size?: 'thumb' | 'medium' | 'large'
  contentFit?: 'cover' | 'contain'
}

export const ArticleThumbnail: React.FC<ArticleThumbnailProps> = React.memo(
  ({ article, style, size = 'medium', contentFit = 'cover' }) => {
    const thumbnailMetadata: MediaMetadata | null | undefined =
      article?.thumbnail

    const imageUrl = useMemo(() => {
      if (!thumbnailMetadata) return null
      if (thumbnailMetadata.media_type === 'SVG') {
        return getStaticPreviewUrl(thumbnailMetadata)
      }
      return getBestImageUrl(thumbnailMetadata, size)
    }, [thumbnailMetadata, size])

    const lqip = thumbnailMetadata?.metadata?.lqip_data_uri

    if (!thumbnailMetadata) {
      return (
        <View style={[styles.placeholder, styles.placeholderEmpty, style]}>
          <ImageOff size={24} color={Colors.light.textTertiary} />
        </View>
      )
    }

    if (thumbnailMetadata.processing_status === 'Processing') {
      return (
        <View style={[styles.placeholder, style]}>
          {lqip ? (
            <ExpoImage
              source={{ uri: lqip }}
              style={styles.image}
              contentFit="cover"
            />
          ) : null}
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color={lqip ? Colors.common.white : Colors.light.textSecondary}
          />
        </View>
      )
    }

    if (
      thumbnailMetadata.processing_status === 'Failed' ||
      (thumbnailMetadata.processing_status === 'Completed' && !imageUrl)
    ) {
      return (
        <View style={[styles.placeholder, styles.placeholderError, style]}>
          <ImageOff size={24} color={Colors.light.error} />
        </View>
      )
    }

    return (
      <ExpoImage
        source={{ uri: imageUrl as string }}
        placeholder={{ uri: lqip }}
        placeholderContentFit="cover"
        contentFit={contentFit}
        style={[styles.image, style]}
        transition={300}
      />
    )
  }
)

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  placeholderEmpty: {
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  placeholderError: {
    backgroundColor: Colors.light.errorBackground,
    borderWidth: 1,
    borderColor: Colors.light.error
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.backgroundSecondary,
    overflow: 'hidden'
  }
})
