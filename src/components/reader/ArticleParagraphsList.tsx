import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import {
  ArticleParagraph,
  WordOccurrence,
  GrammarOccurrence
} from '@features/articles/types'
import { ParagraphRenderer } from '@components/ParagraphRenderer' // Assuming this is the correct path

interface ArticleParagraphsListProps {
  paragraphs: ArticleParagraph[] | undefined | null
  onWordSelect: (
    occurrence: WordOccurrence,
    paragraph: ArticleParagraph,
    layout: {
      pageX: number
      pageY: number
      width: number
      height: number
    } | null
  ) => void
  onGrammarSelect: (
    occurrence: GrammarOccurrence,
    paragraph: ArticleParagraph,
    layout: {
      pageX: number
      pageY: number
      width: number
      height: number
    } | null
  ) => void
  focusedOccurrenceId?: string | null
}

export const ArticleParagraphsList: React.FC<ArticleParagraphsListProps> = ({
  paragraphs,
  onWordSelect,
  onGrammarSelect,
  focusedOccurrenceId
}) => {
  if (!paragraphs || paragraphs.length === 0) {
    // Optionally, render a message or skeleton if paragraphs are loading/empty
    // For now, returning null if no paragraphs.
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No content available for this article.
        </Text>
      </View>
    )
  }

  // Sort paragraphs by index before rendering
  const sortedParagraphs = [...paragraphs].sort(
    (a, b) => a.paragraph_index - b.paragraph_index
  )

  return (
    <View style={styles.articleContent}>
      {sortedParagraphs.map(paragraph => (
        <ParagraphRenderer
          key={paragraph.paragraph_id || paragraph.paragraph_index.toString()} // Ensure key is a string
          paragraph={paragraph}
          onWordSelect={onWordSelect}
          onGrammarSelect={onGrammarSelect}
          focusedOccurrenceId={focusedOccurrenceId}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  articleContent: {
    marginBottom: 24 // Spacing after the paragraphs block
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  }
  // ParagraphRenderer itself handles individual paragraph styling
})
