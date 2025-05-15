import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Volume2 } from 'lucide-react-native'
import { VocabularyType as ArticleVocabularyItem } from '@features/articles/types' // Renaming for clarity within this component
import { Colors } from '@constants/Colors'

interface ArticleVocabularySectionProps {
  vocabulary: ArticleVocabularyItem[] | undefined | null
  isDesktop?: boolean
  // onPlayWordAudio: (word: string) => void; // If audio playback is handled here
  // onSaveWordToVocabulary: (word: string, translation: string) => void; // If saving is handled here
}

export const ArticleVocabularySection: React.FC<
  ArticleVocabularySectionProps
> = ({ vocabulary, isDesktop = false }) => {
  if (!vocabulary || vocabulary.length === 0) {
    return null // Don't render the section if there's no vocabulary
  }

  const handlePlayAudio = (word: string) => {
    // TODO: Implement actual audio playback for the word
    alert(`Play audio for ${word} (Not Implemented)`)
  }

  // const handleSaveWord = (word: string, translation: string) => {
  //   // TODO: Implement logic to save the word to user's vocabulary
  //   alert(`Save word: ${word} - ${translation} (Not Implemented)`);
  // };

  return (
    <View
      style={[
        styles.vocabularySection,
        isDesktop && styles.wideScreenVocabularySection
      ]}
    >
      <Text style={styles.vocabularySectionTitle}>Key Vocabulary</Text>
      {vocabulary.map((item, index) => (
        <View key={index} style={styles.vocabularyItem}>
          <View style={styles.vocabularyWordContainer}>
            <Text style={styles.finnishWord}>{item.word}</Text>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => handlePlayAudio(item.word)}
              accessibilityLabel={`Play audio for ${item.word}`}
            >
              <Volume2 size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.englishTranslation}>{item.translation}</Text>
          {item.example && ( // Conditionally render example if it exists
            <Text style={styles.exampleText}>"{item.example}"</Text>
          )}
        </View>
      ))}
    </View>
  )
}

// Styles are copied and adapted from ArticleScreen.tsx
const styles = StyleSheet.create({
  vocabularySection: {
    paddingHorizontal: 20, // Keep horizontal padding consistent with ArticleScreen's content
    paddingVertical: 20, // Add vertical padding for the section itself
    backgroundColor: Colors.light.cardBackground
    // borderTopWidth: 1, // Removed to simplify, can be added by parent if needed
    // borderTopColor: Colors.light.border,
  },
  wideScreenVocabularySection: {
    maxWidth: 760, // Match content width on desktop
    width: '100%',
    alignSelf: 'center', // Center it if it's narrower than screen
    borderRadius: 12,
    marginTop: 24, // Add margin when it's a distinct card on desktop
    marginBottom: 40
  },
  vocabularySectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16
  },
  vocabularyItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border
    // Remove border from last item - using pseudo-class for web/React Native Web
    // For native, this can be handled by not rendering border for the last item or specific styling.
    // RN doesn't directly support '&:last-child' in StyleSheet.create
  },
  // To handle last-child border in native:
  // You would typically map and check if it's the last item in the render method.
  // For example: style={[styles.vocabularyItem, index === vocabulary.length - 1 && styles.lastVocabularyItem]}
  // And then add: lastVocabularyItem: { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }

  vocabularyWordContainer: {
    // Renamed from vocabularyWord for clarity
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between'
  },
  finnishWord: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
    flexShrink: 1
  },
  audioButton: {
    padding: 4 // Hit area
  },
  englishTranslation: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 4
  },
  exampleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic'
  }
})
