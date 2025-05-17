import React, { useMemo, useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  NativeSyntheticEvent,
  NativeTouchEvent,
  findNodeHandle
} from 'react-native'
import {
  ArticleParagraph,
  WordOccurrence,
  GrammarOccurrence
} from '@features/articles/types'
import { MediaRenderer } from './MediaRenderer'
import { Colors } from '@constants/Colors'
import { X } from 'lucide-react-native'
import { robustWordTokenizer } from '@utils/textUtils'

const MEDIA_TAG_REGEX = /\[MEDIA::([^:]+)::([^\]]+)\]/
const ANIMATION_DURATION = 100

interface TappableTextSegmentProps {
  word: string
  style: any
  onPress: (
    layout: {
      pageX: number
      pageY: number
      width: number
      height: number
    } | null
  ) => void
}

const TappableTextSegment: React.FC<TappableTextSegmentProps> = React.memo(
  ({ word, style, onPress }) => {
    const textRef = useRef<Text>(null)

    const handlePress = useCallback(() => {
      if (textRef.current) {
        setTimeout(() => {
          textRef.current?.measureInWindow((pageX, pageY, width, height) =>
            onPress({ pageX, pageY, width, height })
          )
        }, 0)
      } else {
        onPress(null)
      }
    }, [word, onPress])

    return (
      <Text
        ref={textRef}
        style={style}
        onPress={handlePress}
        collapsable={false}
      >
        {word}
      </Text>
    )
  }
)

interface ParagraphRendererProps {
  paragraph: ArticleParagraph
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

type RenderSegment =
  | {
      type: 'text_token'
      token: { word: string; spaceAfter: string }
      style: any
      key: string
    }
  | {
      type: 'highlighted_token'
      token: { word: string }
      style: any
      occurrenceData: WordOccurrence | GrammarOccurrence
      onPressLayout: (
        layout: {
          pageX: number
          pageY: number
          width: number
          height: number
        } | null
      ) => void
      key: string
    }
  | { type: 'media'; mediaId: string; mimeType: string; key: string }

export const ParagraphRenderer: React.FC<ParagraphRendererProps> = React.memo(
  ({ paragraph, onWordSelect, onGrammarSelect, focusedOccurrenceId }) => {
    const [isTranslatedViewOpen, setIsTranslatedViewOpen] = useState(false)

    const translationAnim = useRef(new Animated.Value(0)).current
    const [translationContentHeight, setTranslationContentHeight] = useState(0)

    const renderableSegments = useMemo(() => {
      const {
        original_text_fi,
        word_occurrences = [],
        grammar_occurrences = []
      } = paragraph
      if (!original_text_fi) return []

      const mediaMatch = original_text_fi.match(MEDIA_TAG_REGEX)
      if (mediaMatch && mediaMatch[1] && mediaMatch[2]) {
        return [
          {
            type: 'media',
            mediaId: mediaMatch[1],
            mimeType: mediaMatch[2],
            key: 'media-0'
          } as RenderSegment
        ]
      }

      const allOccurrences = [
        ...word_occurrences.map(occ => ({
          ...occ,
          _type: 'word' as const,
          _originalData: occ
        })),
        ...grammar_occurrences.map(occ => ({
          ...occ,
          _type: 'grammar' as const,
          _originalData: occ
        }))
      ].sort((a, b) => {
        if (a.start_char_offset !== b.start_char_offset)
          return a.start_char_offset - b.start_char_offset
        return b.end_char_offset - a.end_char_offset
      })

      const segments: RenderSegment[] = []
      let charIndex = 0
      let segmentKeyIndex = 0

      while (charIndex < original_text_fi.length) {
        let activeOccurrence: (typeof allOccurrences)[0] | null = null
        let nextInterestingIndex = original_text_fi.length

        for (const occ of allOccurrences) {
          if (occ.start_char_offset >= charIndex) {
            if (occ.start_char_offset < nextInterestingIndex) {
              nextInterestingIndex = occ.start_char_offset
              activeOccurrence =
                occ.start_char_offset === charIndex ? occ : null
            } else if (
              occ.start_char_offset === nextInterestingIndex &&
              occ.start_char_offset === charIndex
            ) {
              if (!activeOccurrence) activeOccurrence = occ
            }
          }
        }

        if (
          activeOccurrence &&
          activeOccurrence.start_char_offset === charIndex
        ) {
          const phraseContent = original_text_fi.substring(
            activeOccurrence.start_char_offset,
            activeOccurrence.end_char_offset
          )
          const tokensInHighlightedPhrase = robustWordTokenizer(phraseContent)

          const isCurrentlyFocused =
            focusedOccurrenceId === activeOccurrence.occurrence_id
          const baseHighlightStyle =
            activeOccurrence._type === 'word'
              ? styles.highlightedWord
              : styles.highlightedGrammar

          tokensInHighlightedPhrase.forEach((tokenInHighlight, tokenIndex) => {
            segments.push({
              type: 'highlighted_token',
              token: { word: tokenInHighlight.word },
              style: [
                baseHighlightStyle,
                isCurrentlyFocused &&
                  (activeOccurrence._type === 'word'
                    ? styles.focusedHighlightWord
                    : styles.focusedHighlightGrammar)
              ],
              occurrenceData: activeOccurrence._originalData,
              onPressLayout: layout => {
                if (activeOccurrence._type === 'word') {
                  onWordSelect(
                    activeOccurrence._originalData as WordOccurrence,
                    paragraph,
                    layout
                  )
                } else {
                  onGrammarSelect(
                    activeOccurrence._originalData as GrammarOccurrence,
                    paragraph,
                    layout
                  )
                }
              },
              key: `occ-${activeOccurrence.occurrence_id}-${tokenIndex}`
            })
            if (tokenInHighlight.spaceAfter) {
              segments.push({
                type: 'space_after_highlight',
                space: tokenInHighlight.spaceAfter,
                key: `occ-${activeOccurrence.occurrence_id}-${tokenIndex}-innerspace`
              })
            }
          })

          charIndex = activeOccurrence.end_char_offset

          let spaceOrPunctuationAfterOccurrence = ''
          let tempIndex = charIndex
          while (
            tempIndex < original_text_fi.length &&
            original_text_fi[tempIndex].match(/\s/)
          ) {
            spaceOrPunctuationAfterOccurrence += original_text_fi[tempIndex]
            tempIndex++
          }
          const remainingTextForPunctuation =
            original_text_fi.substring(tempIndex)
          const punctuationMatch = remainingTextForPunctuation.match(
            /^([^\s\p{L}\p{N}\p{M}'-]+)/u
          ) // Match leading punctuation
          if (punctuationMatch) {
            spaceOrPunctuationAfterOccurrence += punctuationMatch[0]
            tempIndex += punctuationMatch[0].length
          }

          if (spaceOrPunctuationAfterOccurrence) {
            segments.push({
              type: 'text_token', // Treat it as a plain text token
              token: {
                word: spaceOrPunctuationAfterOccurrence,
                spaceAfter: spaceOrPunctuationAfterOccurrence.trim() ? ' ' : ''
              }, // No further space needed for this segment
              style: styles.plainText,
              key: `text-after-occ-${activeOccurrence.occurrence_id}`
            })
            charIndex = tempIndex // Update charIndex to after this captured space/punctuation
          }
        } else {
          // No occurrence starts exactly at charIndex. This is plain text.
          // The text runs from charIndex up to nextInterestingIndex (start of next occ or end of string).
          const textContent = original_text_fi.substring(
            charIndex,
            nextInterestingIndex
          )
          if (textContent) {
            const plainTokens = robustWordTokenizer(textContent)
            plainTokens.forEach((token, tokenIndex) => {
              segments.push({
                type: 'text_token',
                token: token, // { word: "...", spaceAfter: "..." }
                style: styles.plainText,
                key: `text-${segmentKeyIndex++}-${tokenIndex}`
              })
            })
          }
          charIndex = nextInterestingIndex
        }
      }
      return segments
    }, [paragraph, focusedOccurrenceId, onWordSelect, onGrammarSelect])

    const toggleTranslation = useCallback(() => {
      const toValue = isTranslatedViewOpen ? 0 : 1
      Animated.timing(translationAnim, {
        toValue,
        duration: ANIMATION_DURATION,
        useNativeDriver: false // Animating height requires this
      }).start()
      setIsTranslatedViewOpen(!isTranslatedViewOpen) // Still need to toggle state for conditional render
    }, [isTranslatedViewOpen, translationAnim])

    const animatedTranslationStyle = {
      height: translationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, translationContentHeight] // Animate from 0 to measured height
      }),
      opacity: translationAnim, // Optional: fade in/out
      overflow: 'hidden' // Important for height animation
    }

    if (renderableSegments.length === 0) {
      return (
        <TouchableOpacity
          onPress={toggleTranslation}
          activeOpacity={0.7}
          style={styles.touchableParagraphWrapper}
        >
          <Text style={styles.plainText}>[Empty Paragraph]</Text>
        </TouchableOpacity>
      )
    }

    if (
      renderableSegments.length === 1 &&
      renderableSegments[0].type === 'media'
    ) {
      const mediaSegment = renderableSegments[0]
      return (
        <MediaRenderer
          mediaId={mediaSegment.mediaId}
          initialMimeType={mediaSegment.mimeType}
        />
      )
    }

    return (
      <View style={styles.paragraphOuterContainer}>
        <TouchableOpacity
          onPress={toggleTranslation}
          activeOpacity={0.8}
          style={styles.touchableParagraphWrapper}
        >
          <View style={styles.paragraphSegmentsContainer}>
            {renderableSegments.map(segment => {
              // Key generation needs to be robust
              const keySuffix =
                segment.type === 'highlighted_token'
                  ? segment.occurrenceData.occurrence_id
                  : segment.type === 'text_token'
                  ? `${segment.token.word.substring(0, 3)}-${
                      segment.token.spaceAfter.length
                    }`
                  : segment.type === 'media'
                  ? segment.mediaId
                  : Math.random().toString() // Fallback for key, should be unique

              const key = `${segment.key || segment.type}-${keySuffix}`

              if (segment.type === 'text_token') {
                return (
                  <Text key={key} style={segment.style} collapsable={false}>
                    {segment.token.word}
                    {segment.token.spaceAfter}
                  </Text>
                )
              }
              if (segment.type === 'highlighted_token') {
                return (
                  <TappableTextSegment
                    key={key}
                    word={segment.token.word} // Pass only the word
                    style={segment.style} // Style includes focus if applicable
                    onPress={segment.onPressLayout!}
                  />
                )
              }
              // 'space_after_highlight' type is no longer generated by the new logic.
              // Spaces after highlights are now part of a 'text_token'.

              if (segment.type === 'media') {
                return (
                  <MediaRenderer
                    key={key}
                    mediaId={segment.mediaId}
                    initialMimeType={segment.mimeType}
                  />
                )
              }
              return null
            })}
          </View>
        </TouchableOpacity>

        {true && (
          <Animated.View
            style={[styles.translationPanel, animatedTranslationStyle]}
          >
            {/* Inner view to measure the actual content height */}
            <View
              style={{
                position:
                  translationContentHeight === 0 ? 'absolute' : 'relative',
                opacity: translationContentHeight === 0 ? 0 : 1
              }} // Render off-screen initially for measurement
              onLayout={event => {
                if (event.nativeEvent.layout.height > 0) {
                  setTranslationContentHeight(event.nativeEvent.layout.height)
                }
              }}
            >
              <View style={styles.translationHeader}>
                <Text style={styles.translationPanelTitle}>Translation</Text>
                <TouchableOpacity
                  onPress={toggleTranslation}
                  style={styles.closeTranslationIcon}
                >
                  <X size={16} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.translationPanelText}>
                {paragraph.translation_en || 'No translation available.'}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  paragraphSegmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.light.background,
    borderRadius: 6
  },
  focusedHighlightStyleFromSegment: {
    // This style is applied within TappableTextSegment
    // This is ALREADY handled by focusedOccurrenceId being passed to TappableTextSegment
    // and TappableTextSegment applying styles.highlightedFocus based on its isFocused prop.
    // The focusedHighlight style is applied to the *base* style of the segment.
  },
  plainText: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: Colors.light.text,
    lineHeight: 28
    // No marginRight here by default, let natural spaces in content work
  },
  highlightedWord: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    lineHeight: 28,
    borderRadius: 3, // Optional: for rounded highlights
    paddingHorizontal: 1 // Tiny margin if needed to prevent touching
  },
  highlightedGrammar: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    lineHeight: 28,
    borderRadius: 3,
    paddingHorizontal: 1
  },
  focusedHighlightWord: {
    backgroundColor: '#2563EB',
    color: '#DBEAFE',
    borderRadius: 3
  },
  focusedHighlightGrammar: {
    backgroundColor: '#B45309',
    color: '#FEF3C7',
    borderRadius: 3
  },
  paragraphOuterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: 16, // Spacing between paragraphs
    lineHeight: 28 // Ensure consistent line height for mixed content
  },
  touchableParagraphWrapper: {
    // Retains its purpose
    // backgroundColor: Colors.light.background, // Moved to paragraphSegmentsContainer
    // borderRadius: 6, // Moved to paragraphSegmentsContainer
  },
  // New styles for the TranslationPanel look
  translationPanel: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB' // border-gray-200
    // padding is on the inner content for better animation
    // borderRadius (top part if needed) should be on paragraphOuterContainer if it has bottom border too
  },
  translationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  translationPanelTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    fontWeight: 'bold'
  },
  closeTranslationIcon: {
    padding: 2
  },
  translationPanelText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937', // text-gray-800
    lineHeight: 22, // leading-relaxed
    paddingHorizontal: 12,
    paddingBottom: 10,
    fontWeight: 'normal'
  }
})
