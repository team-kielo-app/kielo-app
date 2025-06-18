import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native'
import { Volume2, Star } from 'lucide-react-native'
import { ReviewItem } from '@features/reviews/types'
import { Colors } from '@constants/Colors'

const wordIconUrl = 'https://cdn-icons-png.flaticon.com/512/2490/2490396.png'

interface WordReviewCardProps {
  item: ReviewItem
  isFlipped: boolean
  onFlip: () => void
}

export function WordReviewCard({
  item,
  isFlipped,
  onFlip
}: WordReviewCardProps): React.ReactElement {
  const playPronunciation = (
    textToSpeak?: string | null,
    lang?: 'fi' | 'en'
  ) => {
    const text =
      textToSpeak ||
      (isFlipped ? item.primary_translation_en : item.display_text)
    if (!text) return
    const actualLang = lang || (isFlipped ? 'en' : 'fi')
    Alert.alert('Play Audio', `Playing: "${text}" (lang: ${actualLang})`)
  }

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
              <Star
                size={12}
                color={Colors.light.warning}
                style={{ marginRight: 4 }}
                fill={Colors.light.warning}
              />
              <Text style={styles.cefrText}>{item.cefr_level}</Text>
            </View>
          )}
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: Colors.light.flashcardIconBgFront }
            ]}
          >
            <Image source={{ uri: wordIconUrl }} style={styles.cardIconImage} />
          </View>
          <Text style={styles.termText}>{item.display_text}</Text>
          {item.review_reason && (
            <Text style={styles.reviewReasonText}>{item.review_reason}</Text>
          )}
          {!item.review_reason && (
            <Text style={styles.instructionText}>Tap to see translation</Text>
          )}

          <TouchableOpacity
            style={[
              styles.playButton,
              { backgroundColor: Colors.light.flashcardAudioButtonFrontBg }
            ]}
            onPress={e => {
              e.stopPropagation()
              playPronunciation(item.display_text, 'fi')
            }}
          >
            <Volume2
              size={24}
              color={Colors.light.flashcardAudioButtonFrontIcon}
            />
          </TouchableOpacity>

          <View style={styles.langFooter}>
            <View
              style={[
                styles.langCircle,
                { backgroundColor: Colors.light.flashcardLangCircleFI }
              ]}
            >
              <Text
                style={[
                  styles.langAbbreviation,
                  { color: Colors.light.flashcardLangTextFI }
                ]}
              >
                FI
              </Text>
            </View>
            <Text style={styles.langName}>Finnish</Text>
          </View>
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
        {item.cefr_level && (
          <View style={styles.cefrBadge}>
            <Star
              size={12}
              color={Colors.light.warning}
              style={{ marginRight: 4 }}
              fill={Colors.light.warning}
            />
            <Text style={styles.cefrText}>{item.cefr_level}</Text>
          </View>
        )}
        <View
          style={[
            styles.cardIconContainer,
            { backgroundColor: Colors.light.flashcardIconBgBack }
          ]}
        >
          <Image source={{ uri: wordIconUrl }} style={styles.cardIconImage} />
        </View>
        <Text style={styles.termText}>
          {item.primary_translation_en || 'N/A'}
        </Text>
        {item.part_of_speech && (
          <Text style={styles.detailTextSmallSemibold}>
            {item.part_of_speech}
          </Text>
        )}
        {item.pronunciation_ipa && (
          <Text style={styles.pronunciationText}>{item.pronunciation_ipa}</Text>
        )}
        {item.word_examples &&
          item.word_examples.length > 0 &&
          item.word_examples[0].sentence_fi && (
            <View style={styles.exampleBox}>
              <Text style={styles.exampleLabel}>Example:</Text>
              <Text style={styles.exampleSentence}>
                {item.word_examples[0].sentence_fi}
              </Text>
            </View>
          )}

        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: Colors.light.flashcardAudioButtonBackBg }
          ]}
          onPress={e => {
            e.stopPropagation()
            playPronunciation(item.primary_translation_en, 'en')
          }}
        >
          <Volume2
            size={24}
            color={Colors.light.flashcardAudioButtonBackIcon}
          />
        </TouchableOpacity>

        <View style={styles.langFooter}>
          <View
            style={[
              styles.langCircle,
              { backgroundColor: Colors.light.flashcardLangCircleEnBg }
            ]}
          >
            <Text
              style={[
                styles.langAbbreviation,
                { color: Colors.light.flashcardLangCircleEnText }
              ]}
            >
              EN
            </Text>
          </View>
          <Text style={styles.langName}>English</Text>
        </View>
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
    elevation: 8
  },
  cardFace: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  cardFront: {},
  cardBack: {},
  cefrBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  cefrText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 11,
    color: Colors.light.textSecondary
  },
  cardIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  cardIconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  termText: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Colors.light.flashcardTermText,
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 4
  },
  reviewReasonText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 10
  },
  instructionText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.light.flashcardInstructionText,
    textAlign: 'center',
    marginBottom: 16
  },
  detailTextSmallSemibold: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.textSecondary,
    marginBottom: 4
  },
  pronunciationText: {
    fontSize: 14,
    fontFamily: 'Inter-MediumItalic',
    color: Colors.light.flashcardPronunciationText,
    marginBottom: 10
  },
  exampleBox: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 8,
    alignSelf: 'stretch'
  },
  exampleLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 11,
    color: Colors.light.textTertiary,
    marginBottom: 2
  },
  exampleSentence: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    textAlign: 'center'
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  langFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  langCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  langAbbreviation: {
    fontSize: 10,
    fontFamily: 'Inter-Bold'
  },
  langName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.light.flashcardTermText,
    marginLeft: 6
  }
})
