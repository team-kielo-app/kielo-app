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
  FileQuestion
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

interface MediaRendererProps {
  mediaId: string
  initialMimeType: string
}

const SCREEN_HEIGHT = Dimensions.get('window').height
const DEFAULT_AR = 4 / 3
const VIDEO_AR = 16 / 9
const TIMESTAMP_WIDTH = 50

// Format a time in seconds to M:SS
type TimeFormatter = (sec: number) => string
const formatTime: TimeFormatter = sec => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' + s : s}`
}

// URL helpers
const getImageUrl = (
  meta?: MediaMetadata,
  type: 'webp' | 'avif' | 'jpeg' = 'webp',
  size: 'medium' | 'thumb' = 'medium'
): string | null => {
  if (!meta || meta.processing_status !== 'Completed' || !meta.variants)
    return null
  const key = `${size}_${type}`
  const fb = `${size}_jpeg`
  const v = meta.variants[key] || meta.variants[fb]
  if (!v?.path) return null
  return `${meta.serve_base_url}processed/${meta.media_id}/${v.path}`
}

const getVideoUrl = (
  meta?: MediaMetadata,
  vKey = 'video_mp4'
): string | null => {
  if (!meta || meta.processing_status !== 'Completed') return null
  const v = meta.variants?.[vKey]
  if (!v?.path) return null
  return `${meta.serve_base_url}processed/${meta.media_id}/${v.path}`
}

const getAudioUrl = (
  meta?: MediaMetadata,
  aKey = 'audio_mp3'
): string | null => {
  if (!meta || meta.processing_status !== 'Completed') return null
  let k = aKey
  if (!meta.variants?.[k]?.path) {
    k =
      Object.keys(meta.variants || {}).find(
        x => x.startsWith('audio_') && meta.variants[x]?.path
      ) || ''
  }
  const v = meta.variants?.[k]
  if (!v?.path) return null
  return `${meta.serve_base_url}processed/${meta.media_id}/${v.path}`
}

export const MediaRenderer: React.FC<MediaRendererProps> = React.memo(
  ({ mediaId, initialMimeType }) => {
    const dispatch = useDispatch<AppDispatch>()
    const meta = useSelector((s: RootState) => selectMediaMetadata(s, mediaId))
    const status = useSelector((s: RootState) => selectMediaStatus(s, mediaId))
    const err = useSelector((s: RootState) => selectMediaError(s, mediaId))

    // Slider state to lock thumb position while sliding
    const [videoSliding, setVideoSliding] = useState(false)
    const [videoSlideValue, setVideoSlideValue] = useState(0)
    const [audioSliding, setAudioSliding] = useState(false)
    const [audioSlideValue, setAudioSlideValue] = useState(0)

    // Fetch metadata
    useEffect(() => {
      if (!status || status === 'idle') {
        dispatch(fetchMediaMetadataThunk(mediaId))
      }
    }, [dispatch, mediaId, status])

    // Calculate aspect ratio
    const ar = useMemo(() => {
      if (initialMimeType.startsWith('audio')) return null
      if (meta?.metadata?.original_width && meta.metadata.original_height) {
        return meta.metadata.original_width / meta.metadata.original_height
      }
      return initialMimeType.startsWith('video') ? VIDEO_AR : DEFAULT_AR
    }, [meta, initialMimeType])

    const vidUri = getVideoUrl(meta)
    const audUri = getAudioUrl(meta)

    // Video player setup
    const videoSource: VideoSource | null = vidUri ? vidUri : null
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
    const audioPlayer = useAudioPlayer(audUri)
    const aStat = useAudioPlayerStatus(audioPlayer)

    const baseStyle: ImageStyle = { width: '100%', height: '100%' }
    const contStyle = [
      styles.container,
      ar && { aspectRatio: ar },
      ar && { maxHeight: SCREEN_HEIGHT * 0.8 }
    ]

    // Render helpers
    const renderLoading = () => {
      const lqip = meta?.metadata?.lqip_data_uri
      return (
        <View style={contStyle}>
          {lqip && ar ? (
            <>
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
            <SkeletonBlock
              width="100%"
              height={ar ? '100%' : 60}
              borderRadius={8}
            />
          )}
        </View>
      )
    }

    const renderError = (
      msg: string | null,
      ctx: 'Metadata' | 'Playback' = 'Metadata'
    ) => (
      <View style={[styles.errorContainer, !ar && styles.audioErrorContainer]}>
        <AlertCircle
          size={24}
          color={Colors.light.error}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.errorText}>
          {ctx} Error: {msg || 'Unknown error'}
        </Text>
      </View>
    )

    const renderInfo = (message: string) => (
      <View style={[styles.infoContainer, !ar && styles.audioInfoContainer]}>
        <Loader2
          size={24}
          color={Colors.light.textSecondary}
          style={{ marginBottom: 8 }}
        />
        <Text style={styles.infoText}>{message}</Text>
      </View>
    )

    // Status checks
    if (status === 'loading' || !status) return renderLoading()
    if (status === 'failed') return renderError(err)
    if (!meta) return renderError('Media metadata not found.')
    if (meta.processing_status !== 'Completed')
      return renderInfo('Media is processing...')

    // Media type logic
    const type = meta.media_type
    const isGif =
      meta.metadata?.original_format === 'gif' ||
      initialMimeType === 'image/gif'

    // GIF
    if (isGif) {
      const gifUrl = getImageUrl(meta, 'jpeg', 'medium')
      if (!gifUrl) return renderError('GIF URL not available.')
      return (
        <View style={contStyle}>
          <ExpoImage
            source={{ uri: gifUrl }}
            style={baseStyle}
            contentFit="contain"
          />
        </View>
      )
    }

    // Image
    if (type === 'Image') {
      const imageUrl = getImageUrl(meta)
      if (!imageUrl) return renderError('Image URL not available.')
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
    }

    // Video
    if (type === 'Video') {
      if (vErr) return renderError(vErr.message, 'Playback')
      if (!videoPlayer) return renderInfo('Initializing video...')
      const loading = vStat?.isBuffering || vStat?.isLoading
      const playing = videoPlayer.playing
      const positionSec = Math.floor((vStat?.positionMillis || 0) / 1000)
      const durationSec = Math.max(
        1,
        Math.floor((vStat?.durationMillis || 0) / 1000)
      )
      const sliderValue = videoSliding ? videoSlideValue : positionSec
      return (
        <View style={contStyle}>
          {loading && (
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
                playing ? videoPlayer.pause() : videoPlayer.play()
              }
              style={styles.controlBtn}
            >
              {playing ? (
                <Pause size={28} color="white" />
              ) : (
                <Play size={28} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.time}>{formatTime(positionSec)}</Text>
            <Slider
              style={styles.slider}
              value={sliderValue}
              minimumValue={0}
              maximumValue={durationSec}
              step={1}
              minimumTrackTintColor={Colors.light.primary}
              maximumTrackTintColor={Colors.light.border}
              thumbTintColor={Colors.light.primary}
              onSlidingStart={() => {
                setVideoSliding(true)
                setVideoSlideValue(positionSec)
              }}
              onValueChange={v => setVideoSlideValue(v)}
              onSlidingComplete={sec => {
                videoPlayer.seekBy(sec - positionSec)
                setVideoSliding(false)
              }}
              disabled={!videoPlayer || durationSec === 0}
            />
            <Text style={styles.time}>{formatTime(durationSec)}</Text>
          </View>
        </View>
      )
    }

    // Audio
    if (type === 'Audio') {
      if (aStat.error) return renderError(aStat.error, 'Playback')
      if (!audioPlayer) return renderInfo('Initializing audio...')
      const loadingA = aStat.isBuffering || !aStat.isLoaded
      const playingA = audioPlayer.playing
      const positionA = Math.floor(aStat.currentTime)
      const durationA = Math.max(1, Math.floor(aStat.duration))
      const sliderAValue = audioSliding ? audioSlideValue : positionA
      return (
        <View style={[styles.container, styles.audioCtrFull]}>
          <TouchableOpacity
            onPress={() =>
              playingA ? audioPlayer.pause() : audioPlayer.play()
            }
            disabled={loadingA}
            style={styles.controlBtn}
          >
            {loadingA ? (
              <ActivityIndicator
                size="large"
                style={{ width: 28, height: 28 }}
                color={Colors.light.primary}
              />
            ) : playingA ? (
              <Pause size={28} color={Colors.light.primary} />
            ) : (
              <Play size={28} color={Colors.light.primary} />
            )}
          </TouchableOpacity>
          <Text style={styles.timeA}>{formatTime(positionA)}</Text>
          <Slider
            style={styles.sliderA}
            value={sliderAValue}
            minimumValue={0}
            maximumValue={durationA}
            step={1}
            minimumTrackTintColor={Colors.light.primary}
            maximumTrackTintColor={Colors.light.border}
            thumbTintColor={Colors.light.primary}
            onSlidingStart={() => {
              setAudioSliding(true)
              setAudioSlideValue(positionA)
            }}
            onValueChange={v => setAudioSlideValue(v)}
            onSlidingComplete={sec => {
              audioPlayer.seekTo(sec)
              setAudioSliding(false)
            }}
            disabled={loadingA || durationA === 0}
          />
          <Text style={styles.timeA}>{formatTime(durationA)}</Text>
        </View>
      )
    }

    // Unsupported
    return renderInfo(`Unsupported media type: ${type}`)
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
    padding: 8,
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
  sliderA: { flex: 1, height: 30 }
})
