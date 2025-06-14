// src/components/reader/ArticleThumbnail.tsx
// src/components/reader/ArticleThumbnail.tsx
import React, { useMemo } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Image as ExpoImage, ImageStyle } from 'expo-image'
// Removed BlurView as LQIP is handled directly by ExpoImage
// import { BlurView } from 'expo-blur';

import { Article } from '@features/articles/types'
import { MediaMetadata } from '@features/media/types'
import { getBestImageUrl, getStaticPreviewUrl } from '@lib/mediaUtils' // Import the helper
import { Colors } from '@constants/Colors'
import { ImageOff } from 'lucide-react-native' // Icon for error state

interface ArticleThumbnailProps {
  article: Article | null | undefined
  style?: ImageStyle
  size?: 'thumb' | 'medium' | 'large' // Size prop for getBestImageUrl
  contentFit?: 'cover' | 'contain'
}

export const ArticleThumbnail: React.FC<ArticleThumbnailProps> = React.memo(
  ({ article, style, size = 'medium', contentFit = 'cover' }) => {
    const thumbnailMetadata: MediaMetadata | null | undefined =
      article?.thumbnail

    const imageUrl = useMemo(() => {
      if (!thumbnailMetadata) return null
      // For article thumbnails, we typically want a raster image.
      // If the thumbnail is an SVG, get its rasterized preview.
      // If it's an Image, get the best image URL.
      if (thumbnailMetadata.media_type === 'SVG') {
        return getStaticPreviewUrl(thumbnailMetadata) // Gets preview_webp for SVG
      }
      return getBestImageUrl(thumbnailMetadata, size) // Handles Image type
    }, [thumbnailMetadata, size])

    const lqip = thumbnailMetadata?.metadata?.lqip_data_uri

    if (!thumbnailMetadata) {
      // No thumbnail metadata on article object
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
              style={styles.image} // Ensure LQIP fills placeholder
              contentFit="cover" // Cover for LQIP
            />
          ) : null}
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            color={lqip ? Colors.light.white : Colors.light.textSecondary} // White if on LQIP, else secondary
          />
        </View>
      )
    }

    if (
      thumbnailMetadata.processing_status === 'Failed' ||
      (thumbnailMetadata.processing_status === 'Completed' && !imageUrl)
    ) {
      // Processing failed, or completed but no suitable URL (e.g. variant missing)
      return (
        <View style={[styles.placeholder, styles.placeholderError, style]}>
          <ImageOff size={24} color={Colors.light.error} />
        </View>
      )
    }

    // Success case: Render the image
    return (
      <ExpoImage
        source={{ uri: imageUrl as string }} // Cast as string, already checked for null
        placeholder={{ uri: lqip }}
        placeholderContentFit="cover" // LQIP should cover
        contentFit={contentFit}
        style={[styles.image, style]} // Ensure image fills and applies passed style
        transition={300}
      />
    )
  }
)

const styles = StyleSheet.create({
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative' // For absolute positioning of ActivityIndicator
  },
  placeholderEmpty: {
    // Specific style for when there's no thumbnail at all
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  placeholderError: {
    backgroundColor: Colors.light.errorLight, // Use a light error background
    borderWidth: 1,
    borderColor: Colors.light.error
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.backgroundLight, // BG for the image component itself
    overflow: 'hidden'
  }
})
