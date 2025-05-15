// src/features/media/types.ts
import { ApiStatusType } from '@lib/api.d'

export interface MediaVariant {
  h: number
  w: number
  path: string
  size: number
  mime_type: string
}

export interface MediaMetadata {
  media_id: string
  media_type: 'Image' | 'Video' | 'Audio' | 'Document' | 'GIF'
  processing_status: 'Queued' | 'Processing' | 'Completed' | 'Failed'
  metadata?: {
    // Nested metadata can vary
    lqip_data_uri?: string | null // Low Quality Image Placeholder
    original_width?: number
    original_height?: number
    duration?: number // For video/audio
    [key: string]: any // Allow other metadata fields
  } | null
  serve_base_url: string // Base URL like https://media.kielo.app/
  variants: {
    [key: string]: MediaVariant // e.g., "thumb_webp", "medium_jpeg", "video_mp4"
  }
  created_at: string
  updated_at: string
}

export interface MediaState {
  metadataById: { [mediaId: string]: MediaMetadata | undefined }
  statusById: { [mediaId: string]: ApiStatusType }
  errorById: { [mediaId: string]: string | null }
}
