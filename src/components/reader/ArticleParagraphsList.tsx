import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { ArticleParagraph } from '@features/articles/types'
import { ParagraphRenderer } from '@components/ParagraphRenderer' // Assuming this is the correct path

interface ArticleParagraphsListProps {
  paragraphs: ArticleParagraph[] | undefined | null
  onParagraphSelect: (paragraph: ArticleParagraph) => void // Callback when a paragraph is selected for translation
}

export const ArticleParagraphsList: React.FC<ArticleParagraphsListProps> = ({
  paragraphs,
  onParagraphSelect
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
          onShowTranslation={() => onParagraphSelect(paragraph)}
          // showTranslation prop was removed from ParagraphRenderer previously,
          // the onPress directly triggers the modal in ArticleScreen
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
