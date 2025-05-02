// src/components/ArticleThumbnail.tsx
import React, { useMemo } from 'react' // Removed useEffect, useDispatch, useSelector
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Image as ExpoImage, ImageStyle } from 'expo-image'
import { BlurView } from 'expo-blur'

import { Article } from '@features/articles/types' // Your Article type
import { MediaMetadata } from '@features/media/types' // Your MediaMetadata type
import { getBestImageUrl } from '@lib/mediaUtils' // Import the helper
import { Colors } from '@constants/Colors'

interface ArticleThumbnailProps {
  article: Article | null | undefined
  style?: ImageStyle
  size?: 'medium' | 'large' | 'thumb'
  contentFit?: 'cover' | 'contain'
}

export const ArticleThumbnail: React.FC<ArticleThumbnailProps> = React.memo(
  ({ article, style, size = 'medium', contentFit = 'cover' }) => {
    // Get thumbnail metadata directly from the article prop
    const thumbnailMetadata: MediaMetadata | null | undefined =
      article?.thumbnail

    // Determine Image URL and Placeholder using the direct metadata
    const imageUrl = useMemo(
      () => getBestImageUrl(thumbnailMetadata, size),
      [thumbnailMetadata, size]
    )
    const lqip = thumbnailMetadata?.metadata?.lqip_data_uri

    // --- Render Logic ---

    // Case: No article or no thumbnail metadata provided
    if (!thumbnailMetadata) {
      console.log(
        `ArticleThumbnail: No thumbnail metadata found for article ID: ${article?.id}`
      )
      return <View style={[styles.placeholder, style]} /> // Render empty placeholder
    }

    // Case: Thumbnail metadata exists but is still processing
    if (thumbnailMetadata.processing_status !== 'Completed') {
      console.log(
        `ArticleThumbnail: Thumbnail processing for article ID: ${article?.id}, status: ${thumbnailMetadata.processing_status}`
      )
      return (
        <View style={[styles.placeholder, style]}>
          <ActivityIndicator color={Colors.light.textSecondary} />
        </View>
      )
    }

    // Case: Processing completed, but couldn't get a valid URL (should be rare if processing is done)
    if (!imageUrl) {
      console.warn(
        `ArticleThumbnail: No suitable image URL found for completed thumbnail, article ID: ${article?.id}`
      )
      return (
        <View style={[styles.placeholder, styles.errorPlaceholder, style]} />
      ) // Error placeholder
    }

    // Case: Success - Render the image
    return (
      <ExpoImage
        source={{ uri: imageUrl }}
        placeholder={{ uri: lqip }} // Use LQIP if available
        placeholderContentFit={contentFit} // Contain placeholder
        contentFit={contentFit} // Fit for the main image ('cover' or 'contain')
        style={[styles.image, style]} // Apply base and passed styles
        transition={300}
      />
    )
  }
)

// Styles remain the same
const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: Colors.light.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  errorPlaceholder: {
    backgroundColor: Colors.light.errorBackground // Indicate error visually
    // Maybe add an error icon here later
  },
  image: {
    backgroundColor: Colors.light.backgroundLight,
    overflow: 'hidden'
  }
})
