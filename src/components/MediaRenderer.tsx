// src/components/MediaRenderer.tsx
import React, { useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Image as ExpoImage, ImageStyle } from 'expo-image' // Import ImageStyle
import { ResizeMode, Video, VideoProps } from 'expo-video' // Import VideoProps for style typing
import { BlurView } from 'expo-blur'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchMediaMetadataThunk,
  selectMediaMetadata,
  selectMediaStatus,
  selectMediaError
} from '@features/media/mediaSlice'
import { MediaMetadata } from '@features/media/types' // Import type
import { SkeletonBlock } from './skeletons/SkeletonElements'
import { Colors } from '@constants/Colors'

interface MediaRendererProps {
  mediaId: string
  initialMimeType: string
}

// --- Constants ---
const SCREEN_HEIGHT = Dimensions.get('window').height
const DEFAULT_ASPECT_RATIO = 4 / 3 // Default aspect ratio if metadata missing
const VIDEO_DEFAULT_ASPECT_RATIO = 16 / 9

// --- Helper Functions (Keep as is or refine URL logic) ---
const getImageUrl = (
  metadata: MediaMetadata | undefined,
  preferredType: 'webp' | 'avif' | 'jpeg' = 'webp',
  size: 'medium' | 'thumb' = 'medium'
): string | null => {
  if (
    !metadata ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  )
    return null
  const key = `${size}_${preferredType}`
  const fallbackKey = `thumb_${preferredType}`
  const variant = metadata.variants[key] || metadata.variants[fallbackKey]
  if (!variant) return null
  const storagePathPrefix = `processed/${metadata.media_id}/`
  return `${metadata.serve_base_url}${storagePathPrefix}${variant.path}`
}

const getVideoUrl = (
  metadata: MediaMetadata | undefined,
  variantKey: string = 'video_mp4'
): string | null => {
  if (
    !metadata ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants ||
    !metadata.variants[variantKey]
  )
    return null
  const storagePathPrefix = `processed/${metadata.media_id}/`
  return `${metadata.serve_base_url}${storagePathPrefix}${metadata.variants[variantKey].path}`
}
// --- End Helper Functions ---

export const MediaRenderer: React.FC<MediaRendererProps> = React.memo(
  ({ mediaId, initialMimeType }) => {
    const dispatch = useDispatch<AppDispatch>()
    const metadata = useSelector((state: RootState) =>
      selectMediaMetadata(state, mediaId)
    )
    const status = useSelector((state: RootState) =>
      selectMediaStatus(state, mediaId)
    )
    const error = useSelector((state: RootState) =>
      selectMediaError(state, mediaId)
    )

    useEffect(() => {
      if (!status || status === 'idle') {
        dispatch(fetchMediaMetadataThunk(mediaId))
      }
    }, [dispatch, mediaId, status])

    // Calculate aspect ratio once metadata is available
    const aspectRatio = useMemo(() => {
      if (
        metadata?.metadata?.original_height &&
        metadata?.metadata?.original_width
      ) {
        return (
          metadata.metadata.original_width / metadata.metadata.original_height
        )
      }
      // Use different defaults based on initial mime type guess if needed
      return initialMimeType.startsWith('video')
        ? VIDEO_DEFAULT_ASPECT_RATIO
        : DEFAULT_ASPECT_RATIO
    }, [metadata, initialMimeType])

    // --- Common Styles based on Aspect Ratio ---
    // Style for the direct media element (Image or Video)
    const mediaElementStyle: ImageStyle | VideoProps['style'] = {
      width: '100%',
      aspectRatio: aspectRatio // Let height be calculated from width and aspect ratio
      // Max height is implicitly handled by the container's max height
    }
    // Style for the container, including loading/placeholder states
    const containerStyle = [
      styles.mediaContainer,
      {
        aspectRatio: aspectRatio, // Container also needs aspect ratio for placeholder/skeleton
        maxHeight: SCREEN_HEIGHT * 0.8 // Limit max height (e.g., 80% of screen)
      }
    ]

    // --- Rendering Logic ---

    // Loading or Initial State
    if (status === 'loading' || status === 'idle' || !status) {
      const lqip = metadata?.metadata?.lqip_data_uri

      return (
        <View style={containerStyle}>
          {lqip ? (
            <>
              {/* LQIP fills the container */}
              <ExpoImage
                source={{ uri: lqip }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
              <BlurView
                intensity={50}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <ActivityIndicator
                style={styles.spinner}
                size="large"
                color={Colors.light.background}
              />
            </>
          ) : (
            // Skeleton also fills the container
            <SkeletonBlock
              width="100%"
              height="100%"
              borderRadius={styles.mediaContainer.borderRadius}
            />
          )}
        </View>
      )
    }

    // Failed State
    if (status === 'failed') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading media: {error || 'Unknown error'}
          </Text>
        </View>
      )
    }

    // Metadata check after status check
    if (!metadata) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Media metadata not found.</Text>
        </View>
      )
    }

    // Processing State
    if (metadata.processing_status !== 'Completed') {
      return (
        <View style={[styles.infoContainer, containerStyle]}>
          <Text style={styles.infoText}>Media is processing...</Text>
        </View>
      )
    }

    // --- Render Completed Media ---
    const mediaType = metadata.media_type

    // Render Image
    if (mediaType === 'Image') {
      const imageUrl = getImageUrl(metadata, 'webp', 'medium')
      const lqip = metadata.metadata?.lqip_data_uri

      if (!imageUrl) {
        return (
          <View style={[styles.errorContainer, containerStyle]}>
            <Text style={styles.errorText}>Image URL not available.</Text>
          </View>
        )
      }

      return (
        <View style={containerStyle}>
          <ExpoImage
            source={{ uri: imageUrl }}
            placeholder={{ uri: lqip }}
            style={mediaElementStyle} // Apply dynamic width/aspectRatio style
            contentFit="contain" // Ensure the image content is contained
            placeholderContentFit="contain"
            transition={300}
          />
        </View>
      )
    }

    // Render Video
    if (mediaType === 'Video') {
      const videoUrl = getVideoUrl(metadata)

      if (!videoUrl) {
        return (
          <View style={[styles.errorContainer, containerStyle]}>
            <Text style={styles.errorText}>Video URL not available.</Text>
          </View>
        )
      }

      return (
        <View style={containerStyle}>
          <Video
            source={{ uri: videoUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode={ResizeMode.CONTAIN} // Ensure video content is contained
            useNativeControls
            style={mediaElementStyle} // Apply dynamic width/aspectRatio style
            onError={error => console.error('Video playback error:', error)}
          />
        </View>
      )
    }

    // Fallback for Unknown Types
    return (
      <View style={[styles.infoContainer, containerStyle]}>
        <Text style={styles.infoText}>Unsupported media type: {mediaType}</Text>
      </View>
    )
  }
)

// --- Styles ---
const styles = StyleSheet.create({
  mediaContainer: {
    width: '100%', // Takes full width of its parent (ParagraphRenderer)
    maxWidth: '100%', // Explicitly prevent exceeding parent
    borderRadius: 8,
    overflow: 'hidden', // Important for border radius and absolute positioning
    marginBottom: 16,
    justifyContent: 'center', // Center spinner/placeholder vertically
    alignItems: 'center', // Center spinner/placeholder horizontally
    backgroundColor: Colors.light.backgroundLight, // Background for skeleton/loading
    alignSelf: 'center' // Ensure container itself is centered if parent is flexbox
  },
  // Removed specific image/video styles as they are now combined in mediaElementStyle
  spinner: {
    position: 'absolute' // Centered via container's justify/alignItems
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: Colors.light.error,
    padding: 15, // More padding for error
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // Give error box some size
    width: '100%'
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    textAlign: 'center'
  },
  infoContainer: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    width: '100%'
  },
  infoText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  }
})
