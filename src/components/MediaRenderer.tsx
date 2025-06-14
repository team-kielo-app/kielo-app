// src/components/MediaRenderer.tsx
// src/components/MediaRenderer.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Image as ExpoImage, ImageStyle } from 'expo-image'
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video'
import { useEvent } from 'expo'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import Slider from '@react-native-community/slider'
import { BlurView } from 'expo-blur'
import {
  Play,
  Pause,
  AlertCircle,
  Loader2,
  FileQuestion,
  ImageOff // For SVG fallback or general image error
} from 'lucide-react-native'

import { AppDispatch, RootState } from '@store/store'
import {
  fetchMediaMetadataThunk,
  selectMediaMetadata,
  selectMediaStatus,
  selectMediaError
} from '@features/media/mediaSlice'
import { MediaMetadata } from '@features/media/types'
import { SkeletonBlock } from './skeletons/SkeletonElements'
import { Colors } from '@constants/Colors'
import {
  getBestImageUrl,
  getBestVideoUrl,
  getBestAudioUrl,
  getGifAsVideoUrl,
  getSvgUrl,
  getStaticPreviewUrl,
  getOriginalFileUrl
} from '@lib/mediaUtils' // Import new utils

interface MediaRendererProps {
  mediaId: string
  initialMimeType: string // Retain for initial AR estimate for non-image types, less critical now
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const DEFAULT_AR = 4 / 3
const VIDEO_AR = 16 / 9
const TIMESTAMP_WIDTH = 50

type TimeFormatter = (sec: number) => string
const formatTime: TimeFormatter = sec => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' + s : s}`
}

export const MediaRenderer: React.FC<MediaRendererProps> = React.memo(
  ({ mediaId, initialMimeType }) => {
    const dispatch = useDispatch<AppDispatch>()
    const meta = useSelector((s: RootState) => selectMediaMetadata(s, mediaId))
    const status = useSelector((s: RootState) => selectMediaStatus(s, mediaId))
    const err = useSelector((s: RootState) => selectMediaError(s, mediaId))

    const [videoSliding, setVideoSliding] = useState(false)
    const [videoSlideValue, setVideoSlideValue] = useState(0)
    const [audioSliding, setAudioSliding] = useState(false)
    const [audioSlideValue, setAudioSlideValue] = useState(0)

    useEffect(() => {
      if (!meta && (!status || status === 'idle' || status === 'failed')) {
        // Fetch if no meta and not already successfully fetched or currently loading
        dispatch(fetchMediaMetadataThunk(mediaId))
      }
    }, [dispatch, mediaId, status, meta])

    const ar = useMemo(() => {
      if (meta?.media_type === 'Audio') return null
      if (meta?.metadata?.original_width && meta.metadata.original_height) {
        return meta.metadata.original_width / meta.metadata.original_height
      }
      if (meta?.media_type === 'Video' || meta?.media_type === 'GIF')
        return VIDEO_AR
      return DEFAULT_AR // For Image, SVG preview
    }, [meta])

    // Video player setup (used for Video and GIF)
    const videoUrl =
      meta?.media_type === 'Video'
        ? getBestVideoUrl(meta)
        : meta?.media_type === 'GIF'
        ? getGifAsVideoUrl(meta)
        : null
    const videoSource: VideoSource | null = videoUrl ? videoUrl : null
    const videoPlayer = useVideoPlayer(videoSource)
    const { status: vStat, error: vErr } = useEvent(
      videoPlayer,
      'statusChange',
      {
        status: videoPlayer?.status,
        error: videoPlayer?.error
      }
    )

    // Audio player setup
    const audioUrl = getBestAudioUrl(meta)
    const audioSource: string | null = audioUrl ? audioUrl : null
    const audioPlayer = useAudioPlayer(audioSource)
    const aStat = useAudioPlayerStatus(audioPlayer)

    const baseStyle: ImageStyle = { width: '100%', height: '100%' }
    const contStyle = [
      styles.container,
      ar && { aspectRatio: ar },
      ar && { maxHeight: SCREEN_HEIGHT * 0.8 }
    ]

    const renderLoading = () => {
      const lqip = meta?.metadata?.lqip_data_uri
      return (
        <View style={contStyle}>
          {lqip && ar ? (
            <>
              <ExpoImage
                source={{ uri: lqip }}
                style={StyleSheet.absoluteFill}
                contentFit="cover" // LQIP should cover
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
            <SkeletonBlock
              width="100%"
              height={ar ? '100%' : 60} // Audio skeleton height
              borderRadius={8}
            />
          )}
        </View>
      )
    }

    const renderError = (
      msg: string | null,
      ctx: 'Metadata' | 'Playback' | 'Format' = 'Metadata'
    ) => (
      <View style={[styles.errorContainer, !ar && styles.audioErrorContainer]}>
        <AlertCircle
          size={ar ? 24 : 18}
          color={Colors.light.error}
          style={{ marginBottom: ar ? 8 : 4 }}
        />
        <Text style={styles.errorText}>
          {ctx} Error: {msg || 'Unknown error'}
        </Text>
      </View>
    )

    const renderInfo = (message: string) => (
      <View style={[styles.infoContainer, !ar && styles.audioInfoContainer]}>
        <Loader2
          size={ar ? 24 : 18}
          color={Colors.light.textSecondary}
          style={{ marginBottom: ar ? 8 : 4 }}
        />
        <Text style={styles.infoText}>{message}</Text>
      </View>
    )

    if (status === 'loading' || (!meta && status !== 'failed'))
      return renderLoading()
    if (status === 'failed' && !meta) return renderError(err, 'Metadata') // No meta, and metadata fetch failed

    if (!meta) return renderError('Media metadata not found.') // Should be caught by above, but defensive

    if (meta.processing_status === 'Processing')
      return renderInfo('Media is processing...')

    if (meta.processing_status === 'Failed') {
      const originalUrl = getOriginalFileUrl(meta)
      if (originalUrl) {
        // Attempt to render original if it's an image or known type
        // This is a simplified fallback. A real app might check mimeType of original.
        if (
          meta.media_type === 'Image' ||
          meta.media_type === 'SVG' ||
          meta.media_type === 'GIF'
        ) {
          return (
            <View style={contStyle}>
              <ExpoImage
                source={{ uri: originalUrl }}
                style={baseStyle}
                contentFit="contain"
              />
              <View style={styles.failedOverlay}>
                <Text style={styles.failedText}>
                  Processing failed. Showing original.
                </Text>
              </View>
            </View>
          )
        }
        // Could add similar fallbacks for video/audio if VideoView/AudioPlayer can handle original URLs
      }
      return renderError(meta.processing_error || 'Processing failed.')
    }

    // Media type specific rendering
    switch (meta.media_type) {
      case 'Image':
        const imageUrl = getBestImageUrl(meta)
        if (!imageUrl) return renderError('Image URL not available.', 'Format')
        return (
          <View style={contStyle}>
            <ExpoImage
              source={{ uri: imageUrl }}
              placeholder={{ uri: meta.metadata?.lqip_data_uri }}
              placeholderContentFit="contain"
              contentFit="contain"
              style={baseStyle}
              transition={300}
            />
          </View>
        )

      case 'SVG':
        const svgUrl = getSvgUrl(meta)
        const svgPreviewUrl = getStaticPreviewUrl(meta) // Rasterized preview
        if (svgUrl) {
          // Attempt to render main SVG, ExpoImage might handle it.
          // If not, one might need react-native-svg for direct SVG string rendering or webview.
          return (
            <View style={contStyle}>
              <ExpoImage
                source={{ uri: svgUrl }}
                placeholder={{ uri: meta.metadata?.lqip_data_uri }}
                placeholderContentFit="contain"
                contentFit="contain" // SVG should scale within bounds
                style={baseStyle}
                transition={300}
                // Add onError to fallback to rasterized preview if SVG fails
                onError={() => {
                  console.warn(
                    `ExpoImage failed to load SVG ${svgUrl}, falling back to preview.`
                  )
                  // This state change would trigger a re-render to show the preview
                  // For simplicity, this example doesn't implement local state for fallback URL
                  // but in a real app, you might set a state variable here.
                }}
              />
            </View>
          )
        } else if (svgPreviewUrl) {
          // Fallback to rasterized preview
          return (
            <View style={contStyle}>
              <ExpoImage
                source={{ uri: svgPreviewUrl }}
                placeholder={{ uri: meta.metadata?.lqip_data_uri }}
                placeholderContentFit="contain"
                contentFit="contain"
                style={baseStyle}
                transition={300}
              />
            </View>
          )
        }
        return renderError('SVG URL not available.', 'Format')

      case 'GIF': // Render GIF as video
      case 'Video':
        if (vErr) return renderError(vErr.message, 'Playback')
        if (!videoPlayer || !videoUrl)
          return renderInfo('Initializing video...')

        const isVidLoading = vStat?.isBuffering || vStat?.isLoading
        const isVidPlaying = videoPlayer.playing
        const vidPosSec = Math.floor((vStat?.positionMillis || 0) / 1000)
        const vidDurSec = Math.max(
          1,
          Math.floor((vStat?.durationMillis || 0) / 1000)
        )
        const vidSliderVal = videoSliding ? videoSlideValue : vidPosSec
        return (
          <View style={contStyle}>
            {isVidLoading && (
              <ActivityIndicator
                size="large"
                style={styles.videoSpinner}
                color={Colors.light.white}
              />
            )}
            <VideoView
              player={videoPlayer}
              style={baseStyle}
              contentFit="contain"
              allowsFullscreen
              allowsPictureInPicture
            />
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() =>
                  isVidPlaying ? videoPlayer.pause() : videoPlayer.play()
                }
                style={styles.controlBtn}
              >
                {isVidPlaying ? (
                  <Pause size={28} color="white" />
                ) : (
                  <Play size={28} color="white" />
                )}
              </TouchableOpacity>
              <Text style={styles.time}>{formatTime(vidPosSec)}</Text>
              <Slider
                style={styles.slider}
                value={vidSliderVal}
                minimumValue={0}
                maximumValue={vidDurSec}
                step={1}
                minimumTrackTintColor={Colors.light.primary}
                maximumTrackTintColor={Colors.light.border}
                thumbTintColor={Colors.light.primary}
                onSlidingStart={() => {
                  setVideoSliding(true)
                  setVideoSlideValue(vidPosSec)
                }}
                onValueChange={v => setVideoSlideValue(v)}
                onSlidingComplete={sec => {
                  videoPlayer.seekBy(sec - vidPosSec)
                  setVideoSliding(false)
                }}
                disabled={!videoPlayer || vidDurSec === 0}
              />
              <Text style={styles.time}>{formatTime(vidDurSec)}</Text>
            </View>
          </View>
        )

      case 'Audio':
        if (aStat.error) return renderError(aStat.error, 'Playback')
        if (!audioPlayer || !audioSource)
          return renderInfo('Initializing audio...')

        const isAudLoading = aStat.isBuffering || !aStat.isLoaded
        const isAudPlaying = audioPlayer.playing
        const audPosSec = Math.floor(aStat.currentTime)
        const audDurSec = Math.max(1, Math.floor(aStat.duration))
        const audSliderVal = audioSliding ? audioSlideValue : audPosSec
        return (
          <View style={[styles.container, styles.audioCtrFull]}>
            <TouchableOpacity
              onPress={() =>
                isAudPlaying ? audioPlayer.pause() : audioPlayer.play()
              }
              disabled={isAudLoading}
              style={styles.controlBtn}
            >
              {isAudLoading ? (
                <ActivityIndicator
                  size="large"
                  style={{ width: 28, height: 28 }}
                  color={Colors.light.primary}
                />
              ) : isAudPlaying ? (
                <Pause size={28} color={Colors.light.primary} />
              ) : (
                <Play size={28} color={Colors.light.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.timeA}>{formatTime(audPosSec)}</Text>
            <Slider
              style={styles.sliderA}
              value={audSliderVal}
              minimumValue={0}
              maximumValue={audDurSec}
              step={1}
              minimumTrackTintColor={Colors.light.primary}
              maximumTrackTintColor={Colors.light.border}
              thumbTintColor={Colors.light.primary}
              onSlidingStart={() => {
                setAudioSliding(true)
                setAudioSlideValue(audPosSec)
              }}
              onValueChange={v => setAudioSlideValue(v)}
              onSlidingComplete={sec => {
                audioPlayer.seekTo(sec)
                setAudioSliding(false)
              }}
              disabled={isAudLoading || audDurSec === 0}
            />
            <Text style={styles.timeA}>{formatTime(audDurSec)}</Text>
          </View>
        )

      default:
        // Fallback for 'Document' or any other unhandled types
        return renderInfo(
          `Unsupported media type: ${meta.media_type || 'Unknown'}`
        )
    }
  }
)

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundLight,
    alignSelf: 'center',
    position: 'relative'
  },
  spinner: { position: 'absolute' },
  videoSpinner: { position: 'absolute', zIndex: 1 },
  errorContainer: {
    borderWidth: 1,
    borderColor: Colors.light.error,
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    width: '100%'
  },
  audioErrorContainer: { minHeight: 60, paddingVertical: 10 },
  errorText: { color: Colors.light.error, fontSize: 14, textAlign: 'center' },
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
  audioInfoContainer: { minHeight: 60, paddingVertical: 10 },
  infoText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    textAlign: 'center'
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)'
  },
  controlBtn: { padding: 8 },
  time: {
    color: 'white',
    fontSize: 12,
    marginHorizontal: 4,
    width: TIMESTAMP_WIDTH,
    textAlign: 'center'
  },
  slider: { flex: 1, height: 30 },
  audioCtrFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8, // Reduced horizontal padding for audio player
    paddingVertical: 12, // Standard vertical padding
    backgroundColor: Colors.light.white,
    borderWidth: 1,
    borderColor: Colors.light.border
  },
  timeA: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginHorizontal: 4,
    width: TIMESTAMP_WIDTH,
    textAlign: 'center'
  },
  sliderA: { flex: 1, height: 30 },
  failedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.7)', // error color with opacity
    paddingVertical: 4,
    alignItems: 'center'
  },
  failedText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: 'bold'
  }
})
