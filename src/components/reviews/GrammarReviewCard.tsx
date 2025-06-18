import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native'
import { ReviewItem } from '@features/reviews/types'
import { Colors } from '@constants/Colors'
import {
  BookText,
  Info,
  AlertTriangle as IconAlertTriangle
} from 'lucide-react-native'
import Markdown from 'react-native-markdown-display'

const grammarIconUrl = 'https://cdn-icons-png.flaticon.com/512/3259/3259689.png'

interface GrammarReviewCardProps {
  item: ReviewItem
  isFlipped: boolean
  onFlip: () => void
}

export function GrammarReviewCard({
  item,
  isFlipped,
  onFlip
}: GrammarReviewCardProps): React.ReactElement {
  const markdownBodyStyle = {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary
  }
  const markdownHeadingStyle = {
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary,
    marginTop: 8,
    marginBottom: 4
  }
  const markdownStyles = StyleSheet.create({
    body: markdownBodyStyle,
    heading2: { ...markdownHeadingStyle, fontSize: 15 },
    heading3: { ...markdownHeadingStyle, fontSize: 14 },
    list_item: { marginVertical: 2 },
    bullet_list_icon: {
      color: Colors.light.primary,
      marginRight: 4,
      fontSize: 16
    },
    ordered_list_icon: {
      color: Colors.light.primary,
      marginRight: 4,
      fontSize: 14,
      fontFamily: 'Inter-Medium'
    }
  })

  if (!isFlipped) {
    return (
      <TouchableOpacity
        onPress={onFlip}
        activeOpacity={0.95}
        style={styles.flashcardShell}
      >
        <View style={[styles.cardFace, styles.cardFront]}>
          {item.cefr_level && (
            <View style={styles.cefrBadge}>
              <Text style={styles.cefrText}>{item.cefr_level}</Text>
            </View>
          )}
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: Colors.light.secondaryLight }
            ]}
          >
            <Image
              source={{ uri: grammarIconUrl }}
              style={styles.cardIconImage}
            />
          </View>
          <Text style={styles.termText}>
            {item.display_text || item.grammar_name_fi || 'Grammar Concept'}
          </Text>
          {item.grammar_category && (
            <Text style={styles.categoryText}>{item.grammar_category}</Text>
          )}
          <Text style={styles.instructionText}>
            Tap to see details & examples
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onFlip}
      activeOpacity={0.95}
      style={styles.flashcardShell}
    >
      <View style={[styles.cardFace, styles.cardBack]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
        >
          <Text style={styles.termTextBack}>
            {item.display_text || item.grammar_name_fi}
          </Text>

          {item.grammar_explanation_en && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Info
                  size={15}
                  color={Colors.light.primary}
                  style={{ marginRight: 4 }}
                />{' '}
                Key Idea
              </Text>
              <Markdown style={markdownStyles}>
                {item.grammar_explanation_en}
              </Markdown>
            </View>
          )}

          {item.grammar_examples && item.grammar_examples.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <BookText
                  size={15}
                  color={Colors.light.primary}
                  style={{ marginRight: 4 }}
                />{' '}
                Examples
              </Text>
              {item.grammar_examples.slice(0, 2).map((ex, index) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleFi}>{ex.sentence_fi}</Text>
                  {ex.translation_en && (
                    <Text style={styles.exampleEn}>"{ex.translation_en}"</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {item.common_mistakes_en && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <IconAlertTriangle
                  size={15}
                  color={Colors.light.warning}
                  style={{ marginRight: 4 }}
                />{' '}
                Common Mistake
              </Text>
              <Text style={styles.detailTextNormal}>
                {item.common_mistakes_en}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  flashcardShell: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 24,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden'
  },
  cardFace: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center'
  },
  cardFront: {
    justifyContent: 'center'
  },
  cardBack: {
    justifyContent: 'flex-start'
  },
  cefrBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderSubtle
  },
  cefrText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: Colors.light.textSecondary
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  cardIconImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain'
  },
  termText: {
    fontSize: 26,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 4
  },
  termTextBack: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 12
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textTertiary,
    textAlign: 'center',
    marginTop: 8
  },
  section: {
    alignSelf: 'stretch',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderSubtle
  },
  sectionLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailTextNormal: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20
  },
  exampleItem: {
    marginBottom: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 8,
    borderRadius: 6
  },
  exampleFi: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2
  },
  exampleEn: {
    fontFamily: 'Inter-RegularItalic',
    fontSize: 13,
    color: Colors.light.textSecondary
  }
})
