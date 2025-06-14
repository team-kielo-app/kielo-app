// src/features/media/types.ts
// src/features/media/types.ts
import { ApiStatusType } from '@lib/api.d'

export interface MediaVariant {
  path: string
  mime_type: string
  width?: number // Optional, for image/video
  height?: number // Optional, for image/video
  size: number // File size in bytes
  duration?: number // Optional, float, in seconds, for video/audio/gif-video
  bitrate?: string // Optional, e.g., '192k', for video/audio
  codec?: string // Optional, e.g., 'webp', 'av1', 'aac'
}

// Corresponds to the 'metadata' object in the API response (ProcessingMetadata)
export interface MediaProcessingMetadata {
  original_width?: number
  original_height?: number
  original_duration?: number // float, in seconds
  original_format?: string // e.g., 'jpeg', 'mp4', 'gif'
  original_codec?: string // e.g., 'h264', 'aac', 'gif'
  original_audio_codec?: string // e.g., 'aac'
  lqip_data_uri?: string | null // Base64 WebP Data URI
  [key: string]: any // Allow other metadata fields
}

export interface MediaMetadata {
  media_id: string
  media_type: 'Image' | 'Video' | 'Audio' | 'GIF' | 'SVG' | 'Document' // Added GIF, SVG
  processing_status: 'Queued' | 'Processing' | 'Completed' | 'Failed'
  processing_error?: string | null // Added from spec
  metadata?: MediaProcessingMetadata | null
  serve_base_url: string // Base URL like https://media.kielo.app/processed/{media_id}/
  variants: {
    [key: string]: MediaVariant // e.g., "thumb_webp", "main_av1", "original"
  }
  created_at: string
  updated_at: string
}

export interface MediaState {
  metadataById: { [mediaId: string]: MediaMetadata | undefined }
  statusById: { [mediaId: string]: ApiStatusType }
  errorById: { [mediaId: string]: string | null }
}
