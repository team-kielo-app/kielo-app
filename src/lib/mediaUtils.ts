// src/lib/mediaUtils.ts
// src/lib/mediaUtils.ts
import { MediaMetadata } from '@features/media/types' // Adjust path if needed

type ImageSizeProp = 'thumb' | 'medium' | 'large' // Size prop used by components
type ImageFormat = 'webp' | 'avif' | 'jpeg' // Note: avif is in spec, jpeg is fallback

/**
 * Constructs the full URL for a given variant.
 * @param metadata - The media metadata object.
 * @param variantPath - The path of the variant file.
 * @returns The full URL string or null if inputs are invalid.
 */
const constructMediaUrl = (
  metadata: MediaMetadata | undefined | null,
  variantPath: string | undefined | null
): string | null => {
  if (!metadata || !variantPath) {
    return null
  }
  // serve_base_url already includes /processed/{media_id}/
  return `${metadata.serve_base_url}${variantPath}`
}

/**
 * Selects the best available image variant URL from metadata for raster images.
 * Prioritizes formats and falls back gracefully.
 *
 * @param metadata - The media metadata object.
 * @param preferredSizeProp - The desired size ('thumb', 'medium', 'large').
 * @param preferredFormat - The preferred image format ('avif', 'webp', 'jpeg').
 * @returns The full URL string or null if no suitable variant found.
 */
export const getBestImageUrl = (
  metadata: MediaMetadata | undefined | null,
  preferredSizeProp: ImageSizeProp = 'medium',
  preferredFormat: ImageFormat = 'avif'
): string | null => {
  if (
    !metadata ||
    (metadata.media_type !== 'Image' && metadata.media_type !== 'SVG') || // SVG previews are raster
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }

  // Map prop size to variant key prefix
  const sizePrefixMap: Record<ImageSizeProp, ('thumb' | 'mid')[]> = {
    thumb: ['thumb'],
    medium: ['mid', 'thumb'], // Fallback for medium
    large: ['mid', 'thumb'] // Fallback for large (use 'mid' as largest raster example)
  }

  const sizePrefixesToTry = sizePrefixMap[preferredSizeProp]
  const formatKeys: ImageFormat[] = [preferredFormat, 'webp', 'jpeg'] // Define format priority

  for (const prefix of sizePrefixesToTry) {
    for (const format of formatKeys) {
      // For SVG, the preview is always webp and typically corresponds to 'mid' or 'thumb' size implicitly
      const variantKey =
        metadata.media_type === 'SVG' ? 'preview_webp' : `${prefix}_${format}`
      const variant = metadata.variants[variantKey]
      if (variant?.path) {
        return constructMediaUrl(metadata, variant.path)
      }
    }
  }

  // Fallback for SVG if preview_webp wasn't found with specific size_format construction
  if (metadata.media_type === 'SVG' && metadata.variants['preview_webp']) {
    return constructMediaUrl(metadata, metadata.variants['preview_webp'].path)
  }

  console.warn(
    `No suitable image variant found for media ${metadata.media_id} (type: ${metadata.media_type}) with preferences size=${preferredSizeProp}, format=${preferredFormat}`
  )
  return null
}

/**
 * Gets the URL for a static preview image (typically 'preview_webp').
 * Used for GIF, SVG, and Video.
 *
 * @param metadata - The media metadata object.
 * @returns The full URL string or null.
 */
export const getStaticPreviewUrl = (
  metadata: MediaMetadata | undefined | null
): string | null => {
  if (
    !metadata ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }
  const variant = metadata.variants['preview_webp']
  return variant?.path ? constructMediaUrl(metadata, variant.path) : null
}

/**
 * Gets the best video URL for a GIF, prioritizing specified codecs.
 *
 * @param metadata - The media metadata object, must be of type 'GIF'.
 * @param preferredCodecs - Array of preferred video codecs ('av1', 'vp9').
 * @returns The full URL string or null.
 */
export const getGifAsVideoUrl = (
  metadata: MediaMetadata | undefined | null,
  preferredCodecs: ('av1' | 'vp9')[] = ['av1', 'vp9']
): string | null => {
  if (
    !metadata ||
    metadata.media_type !== 'GIF' ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }

  for (const codec of preferredCodecs) {
    const variantKey = `main_${codec}` // e.g., "main_av1", "main_vp9"
    const variant = metadata.variants[variantKey]
    if (variant?.path) {
      return constructMediaUrl(metadata, variant.path)
    }
  }
  return null
}

/**
 * Gets the URL for the main SVG variant.
 *
 * @param metadata - The media metadata object, must be of type 'SVG'.
 * @returns The full URL string or null.
 */
export const getSvgUrl = (
  metadata: MediaMetadata | undefined | null
): string | null => {
  if (
    !metadata ||
    metadata.media_type !== 'SVG' ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }
  const variant = metadata.variants['main_svg']
  return variant?.path ? constructMediaUrl(metadata, variant.path) : null
}

/**
 * Gets the best video URL for a Video, prioritizing specified codecs.
 *
 * @param metadata - The media metadata object, must be of type 'Video'.
 * @param preferredCodecs - Array of preferred video codecs ('av1', 'vp9').
 * @returns The full URL string or null.
 */
export const getBestVideoUrl = (
  metadata: MediaMetadata | undefined | null,
  preferredCodecs: ('av1' | 'vp9')[] = ['av1', 'vp9']
): string | null => {
  if (
    !metadata ||
    metadata.media_type !== 'Video' ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }
  for (const codec of preferredCodecs) {
    const variantKey = `main_${codec}`
    const variant = metadata.variants[variantKey]
    if (variant?.path) {
      return constructMediaUrl(metadata, variant.path)
    }
  }
  return null
}

/**
 * Gets the best audio URL, prioritizing specified codecs.
 *
 * @param metadata - The media metadata object, must be of type 'Audio'.
 * @param preferredCodecs - Array of preferred audio codecs ('aac', 'mp3').
 * @returns The full URL string or null.
 */
export const getBestAudioUrl = (
  metadata: MediaMetadata | undefined | null,
  preferredCodecs: ('aac' | 'mp3')[] = ['aac', 'mp3']
): string | null => {
  if (
    !metadata ||
    metadata.media_type !== 'Audio' ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }
  for (const codec of preferredCodecs) {
    const variantKey = `main_${codec}` // e.g. "main_aac", "main_mp3"
    const variant = metadata.variants[variantKey]
    if (variant?.path) {
      return constructMediaUrl(metadata, variant.path)
    }
  }
  return null
}

/**
 * Gets the URL for the original file, used as a fallback if processing failed.
 *
 * @param metadata - The media metadata object.
 * @returns The full URL string or null.
 */
export const getOriginalFileUrl = (
  metadata: MediaMetadata | undefined | null
): string | null => {
  if (!metadata || !metadata.variants) {
    return null
  }
  // Only use if processing actually failed, otherwise prefer processed variants
  if (metadata.processing_status !== 'Failed') {
    // console.warn("getOriginalFileUrl called but processing status is not 'Failed'. This might not be the intended use.");
    // return null; // Or decide if you want to allow access to original even on success
  }
  const variant = metadata.variants['original']
  return variant?.path ? constructMediaUrl(metadata, variant.path) : null
}
