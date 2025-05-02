// src/components/ParagraphRenderer.tsx
import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { ArticleParagraph } from '@features/articles/types' // Your paragraph type
import { MediaRenderer } from './MediaRenderer' // The component created above
import { Colors } from '@constants/Colors'

interface ParagraphRendererProps {
  paragraph: ArticleParagraph
  showTranslation: boolean // Prop to control translation display
  onPlayAudio?: (url: string) => void // Callback for audio playback
}

// Regex to find the custom media tag
// Captures: 1=media_id, 2=mime_type
const MEDIA_TAG_REGEX = /\[MEDIA::([^:]+)::([^\]]+)\]/

export const ParagraphRenderer: React.FC<ParagraphRendererProps> = React.memo(
  ({ paragraph, onShowTranslation }) => {
    const mediaMatch = paragraph.original_text_fi?.match(MEDIA_TAG_REGEX) // Check the text for the tag

    // Use useMemo to avoid re-calculating on every render unless text changes
    const content = useMemo(() => {
      if (mediaMatch && mediaMatch[1] && mediaMatch[2]) {
        const mediaId = mediaMatch[1]
        const mimeType = mediaMatch[2]
        // Render the Media component if tag is found
        return <MediaRenderer mediaId={mediaId} initialMimeType={mimeType} />
      } else {
        // Render Markdown for normal text
        // Handle potential null/undefined text
        return (
          <Markdown style={markdownStyles}>
            {paragraph.original_text_fi || ''}
          </Markdown>
        )
      }
    }, [paragraph.original_text_fi, mediaMatch, markdownStyles]) // Dependencies

    return (
      <TouchableOpacity
        style={styles.paragraphContainer}
        onPress={onShowTranslation}
        activeOpacity={0.7}
      >
        {/* Render either Markdown or Media */}
        {content}
      </TouchableOpacity>
    )
  }
)

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 17,
    color: Colors.light.text,
    lineHeight: 28,
    fontFamily: 'Inter-Regular'
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: Colors.light.text
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: Colors.light.text
  },
  strong: { fontFamily: 'Inter-Bold' }, // Use bold font variant
  em: { fontStyle: 'italic' },
  link: { color: Colors.light.primary },
  // Add styles for lists, blockquotes etc. if your markdown uses them
  bullet_list: { marginBottom: 15 },
  ordered_list: { marginBottom: 15 },
  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  bullet_list_icon: { marginRight: 8, marginTop: 6, fontSize: 16 }, // Style bullet points
  ordered_list_icon: { marginRight: 8, marginTop: 4, fontSize: 16 } // Style numbers
})

const styles = StyleSheet.create({
  paragraphContainer: {
    position: 'relative'
  },
  audioButton: {
    position: 'absolute',
    right: 0,
    top: 0, // Adjust vertical alignment if needed
    padding: 8
  }
  // Add other styles if needed
})
