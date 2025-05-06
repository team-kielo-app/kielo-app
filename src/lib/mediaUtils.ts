// src/lib/mediaUtils.ts
import { MediaMetadata } from '@features/media/types' // Adjust path if needed

type ImageSize = 'thumb' | 'medium' | 'large' // Define possible sizes you might have
type ImageFormat = 'webp' | 'avif' | 'jpeg'

/**
 * Selects the best available image variant URL from metadata.
 * Prioritizes formats and falls back gracefully.
 *
 * @param metadata - The media metadata object.
 * @param preferredSize - The desired size ('medium', 'thumb', 'large').
 * @param preferredFormat - The preferred image format ('webp', 'avif', 'jpeg').
 * @returns The full URL string or null if no suitable variant found.
 */
export const getBestImageUrl = (
  metadata: MediaMetadata | undefined | null,
  preferredSize: ImageSize = 'medium',
  preferredFormat: ImageFormat = 'webp'
): string | null => {
  if (
    !metadata ||
    metadata.media_type !== 'Image' ||
    metadata.processing_status !== 'Completed' ||
    !metadata.variants
  ) {
    return null
  }

  const sizeKeys: ImageSize[] = [preferredSize]
  // Add fallbacks for size if needed (e.g., if medium requested but only large exists)
  if (preferredSize === 'medium') sizeKeys.push('large', 'thumb')
  else if (preferredSize === 'large') sizeKeys.push('medium', 'thumb')
  else sizeKeys.push('medium', 'large') // thumb requested

  const formatKeys: ImageFormat[] = [preferredFormat, 'webp', 'jpeg'] // Define format priority

  for (const size of sizeKeys) {
    for (const format of formatKeys) {
      const variantKey = `${size}_${format}`
      const variant = metadata.variants[variantKey]
      if (variant && variant.path) {
        // Construct URL based on assumed pattern (VERIFY THIS PATTERN!)
        const storagePathPrefix = `processed/${metadata.media_id}/`
        return `${metadata.serve_base_url}/${storagePathPrefix}${variant.path}`
      }
    }
  }

  console.warn(
    `No suitable image variant found for media ${metadata.media_id} with preferences size=${preferredSize}, format=${preferredFormat}`
  )
  return null // No suitable variant found
}

// You could add getVideoUrl here too if desired
