// src/components/reader/InteractiveDetailPopup.tsx
import React, { useRef, useEffect, useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native'
import { X, Volume2, Save, BookOpen } from 'lucide-react-native' // Updated icons
// import { Colors } from '@constants/Colors'; // We'll define colors locally or use new ones
import {
  ArticleParagraph,
  WordOccurrence,
  GrammarOccurrence,
  BaseWordDetail,
  GrammarDetail,
  InflectedFormDetails
} from '@features/articles/types'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CustomScrollView } from '@/components/common/CustomScrollView'

export type PopupContentMode = 'word' | 'grammar' | null

interface InteractiveDetailPopupProps {
  isVisible: boolean
  contentMode: PopupContentMode
  // paragraphData: ArticleParagraph | null; // For paragraph translation & context - Not in web popovers, removing for now to match
  wordOccurrenceData: WordOccurrence | null
  grammarOccurrenceData: GrammarOccurrence | null
  onClose: () => void
  onSaveWord?: (baseWord: BaseWordDetail) => void
  onSaveGrammar?: (grammar: GrammarDetail) => void
  onLearnMoreWord?: (baseWord: BaseWordDetail) => void // Example action
  onLearnMoreGrammar?: (grammar: GrammarDetail) => void // Example action
  // onPlayAudio?: (text: string, lang?: 'fi' | 'en') => void; // Can be handled internally or via prop
  isDesktop?: boolean // Retained for potential platform-specific adjustments
  popupPosition: {
    top: number
    left: number
    targetWidth: number
    targetHeight: number
  } | null
}

const POPUP_MAX_HEIGHT_PERCENT = 0.5 // Max 50% of screen height
const POPUP_WIDTH = 320 // Corresponds to w-80

const POPUP_DEFAULT_WIDTH = 320
const POPUP_MAX_WIDTH_PERCENT = 0.9 // Max 90% of screen width

const POPUP_MARGIN_FROM_TARGET = 5 // Space between target and popup
const SCREEN_EDGE_MARGIN = 10 // Min space from screen edges

const SCREEN_DIMENSIONS = Dimensions.get('window')

// Define colors based on Tailwind names
const AppColors = {
  white: '#FFFFFF',
  black: '#000000',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB', // border
  gray400: '#9CA3AF', // close icon
  gray500: '#6B7280', // secondary text
  gray600: '#4B5563', // paragraph text
  gray700: '#374151', // medium text, section titles
  gray800: '#1F2937', // example text
  gray900: '#11182C', // main title text

  amber50: '#FFFBEB',
  amber100: '#FEF3C7', // save button bg (grammar)
  amber200: '#FDE68A', // save button hover bg (grammar)
  amber700: '#B45309', // text on amber bg
  amber800: '#92400E', // text on amber bg

  green100: '#DCFCE7',
  green200: '#BBF7D0',
  green800: '#166534',

  blue100: '#DBEAFE', // save button bg (word)
  blue200: '#BFDBFE', // save button hover bg (word)
  blue600: '#2563EB', // learn more text
  blue800: '#1E40AF', // learn more hover, text on blue bg

  purple100: '#F3E8FF',
  purple200: '#E9D5FF',
  purple800: '#581C87'
}

// Determine CEFR level badge color and text color
const getCefrStyle = (
  level: string | null | undefined
): { backgroundColor: string; color: string } => {
  switch (level) {
    case 'A1':
      return { backgroundColor: AppColors.green100, color: AppColors.green800 }
    case 'A2':
      return { backgroundColor: AppColors.green200, color: AppColors.green800 }
    case 'B1':
      return { backgroundColor: AppColors.blue100, color: AppColors.blue800 }
    case 'B2':
      return { backgroundColor: AppColors.blue200, color: AppColors.blue800 }
    case 'C1':
      return {
        backgroundColor: AppColors.purple100,
        color: AppColors.purple800
      }
    case 'C2':
      return {
        backgroundColor: AppColors.purple200,
        color: AppColors.purple800
      }
    default:
      return { backgroundColor: AppColors.gray100, color: AppColors.gray800 }
  }
}

// Format case display for readability (from WordPopover)
const formatCase = (caseValue: string | null | undefined): string => {
  if (!caseValue) return 'N/A'
  return caseValue.charAt(0).toUpperCase() + caseValue.slice(1).toLowerCase()
}

export const InteractiveDetailPopup: React.FC<InteractiveDetailPopupProps> = ({
  isVisible,
  contentMode,
  wordOccurrenceData,
  grammarOccurrenceData,
  onClose,
  onSaveWord,
  onSaveGrammar,
  onLearnMoreWord,
  onLearnMoreGrammar,
  isDesktop = false,
  popupPosition
}) => {
  const anim = useRef(new Animated.Value(0)).current
  // contentNaturalHeight: the height the content *would* take if unconstrained
  const [contentNaturalHeight, setContentNaturalHeight] = useState<
    number | null
  >(null)
  const safeAreaInsets = useSafeAreaInsets()

  const [isMounted, setIsMounted] = useState(isVisible)
  useEffect(() => {
    if (!isVisible || !popupPosition) {
      setContentNaturalHeight(null) // Reset measured height when hiding or target is gone
    }
    // Animation logic for isVisible
    Animated.timing(anim, {
      toValue: isVisible && popupPosition ? 1 : 0,
      duration: isVisible ? 250 : 150,
      useNativeDriver: false
    }).start(() => setIsMounted(false))
  }, [isVisible, popupPosition, anim])

  const onActualContentLayout = (event: {
    nativeEvent: { layout: { height: number } }
  }) => {
    const newHeight = event.nativeEvent.layout.height
    if (newHeight > 0 && newHeight !== contentNaturalHeight) {
      setContentNaturalHeight(newHeight)
    }
  }

  const handleInternalClose = useCallback(() => {
    onClose()
  }, [onClose])

  const renderWordDetails = () => {
    if (!wordOccurrenceData || !wordOccurrenceData.base_word_detail) return null
    const {
      base_word_detail,
      inflected_form_details,
      specific_explanation_en
    } = wordOccurrenceData

    const cefrStyle = getCefrStyle(base_word_detail.cefr_level)

    return (
      <>
        {/* Header */}
        <View style={styles.popoverHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{base_word_detail.word_fi}</Text>
            <View
              style={[
                styles.cefrBadge,
                { backgroundColor: cefrStyle.backgroundColor }
              ]}
            >
              <Text style={[styles.cefrBadgeText, { color: cefrStyle.color }]}>
                {base_word_detail.cefr_level || 'N/A'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleInternalClose}
            accessibilityLabel="Close"
            style={styles.closeButton}
          >
            <X size={18} color={AppColors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Part of Speech & Translation */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.secondaryTextSm}>
            {base_word_detail.part_of_speech}
          </Text>
          <Text style={styles.regularTextSm}>
            <Text style={styles.fontMedium}>Translation: </Text>
            {base_word_detail.primary_translation_en}
          </Text>
          {base_word_detail.pronunciation_ipa && (
            <View style={styles.pronunciationContainer}>
              <Text style={styles.regularTextSm}>
                <Text style={styles.fontMedium}>Pronunciation: </Text>
                <Text style={styles.fontMono}>
                  {base_word_detail.pronunciation_ipa}
                </Text>
              </Text>
              <TouchableOpacity
                style={styles.pronunciationButton}
                onPress={() => {
                  /* TODO: Play audio */
                }}
              >
                <Volume2 size={16} color={AppColors.blue600} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Inflected Form Details */}
        {(inflected_form_details?.case ||
          inflected_form_details?.number ||
          inflected_form_details?.person ||
          inflected_form_details?.tense) && (
          <View style={[styles.infoBox, styles.sectionSpacing]}>
            <Text style={styles.infoBoxTitle}>Word Form</Text>
            <View style={styles.inflectionGrid}>
              {inflected_form_details.case && (
                <View style={styles.inflectionItem}>
                  <Text style={styles.inflectionLabel}>Case: </Text>
                  <Text style={styles.inflectionValue}>
                    {formatCase(inflected_form_details.case)}
                  </Text>
                </View>
              )}
              {inflected_form_details.number && (
                <View style={styles.inflectionItem}>
                  <Text style={styles.inflectionLabel}>Number: </Text>
                  <Text style={styles.inflectionValue}>
                    {formatCase(inflected_form_details.number)}
                  </Text>
                </View>
              )}
              {inflected_form_details.person && (
                <View style={styles.inflectionItem}>
                  <Text style={styles.inflectionLabel}>Person: </Text>
                  <Text style={styles.inflectionValue}>
                    {formatCase(inflected_form_details.person)}
                  </Text>
                </View>
              )}
              {inflected_form_details.tense && (
                <View style={styles.inflectionItem}>
                  <Text style={styles.inflectionLabel}>Tense: </Text>
                  <Text style={styles.inflectionValue}>
                    {formatCase(inflected_form_details.tense)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Explanation */}
        {specific_explanation_en && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.subHeader}>Explanation</Text>
            <Text style={styles.paragraphText}>{specific_explanation_en}</Text>
          </View>
        )}

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => onLearnMoreWord && onLearnMoreWord(base_word_detail)}
          >
            <BookOpen
              size={14}
              color={AppColors.blue600}
              style={styles.buttonIcon}
            />
            <Text style={styles.learnMoreButtonText}>See full details</Text>
          </TouchableOpacity>
          {onSaveWord && (
            <TouchableOpacity
              style={[styles.saveButtonBase, styles.saveButtonWord]}
              onPress={() => onSaveWord(base_word_detail)}
            >
              <Save
                size={14}
                color={AppColors.blue800}
                style={styles.buttonIcon}
              />
              <Text
                style={[styles.saveButtonTextBase, styles.saveButtonTextWord]}
              >
                Save Word
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    )
  }

  const renderGrammarDetails = () => {
    if (!grammarOccurrenceData || !grammarOccurrenceData.grammar_detail)
      return null
    const { grammar_detail, specific_explanation_en, original_token_phrase } =
      grammarOccurrenceData

    const cefrStyle = getCefrStyle(grammar_detail.cefr_level)

    return (
      <>
        {/* Header */}
        <View style={styles.popoverHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{grammar_detail.name_en}</Text>
            <View
              style={[
                styles.cefrBadge,
                { backgroundColor: cefrStyle.backgroundColor }
              ]}
            >
              <Text style={[styles.cefrBadgeText, { color: cefrStyle.color }]}>
                {grammar_detail.cefr_level || 'N/A'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleInternalClose}
            accessibilityLabel="Close"
            style={styles.closeButton}
          >
            <X size={18} color={AppColors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.secondaryTextSm}>{grammar_detail.category}</Text>
        </View>

        {/* Original Token Phrase Highlight */}
        <View style={[styles.highlightBoxAmber, styles.sectionSpacing]}>
          <Text style={styles.highlightBoxAmberTextPrimary}>
            {original_token_phrase}
          </Text>
          <Text style={styles.highlightBoxAmberTextSecondary}>
            {grammar_detail.name_fi}
          </Text>
        </View>

        {/* In This Context */}
        {specific_explanation_en && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.subHeader}>In This Context</Text>
            <Text style={styles.paragraphText}>{specific_explanation_en}</Text>
          </View>
        )}

        {/* General Rule */}
        {grammar_detail.rule_summary_en && (
          <View style={styles.sectionSpacing}>
            <Text style={styles.subHeader}>General Rule</Text>
            <Text style={styles.paragraphText}>
              {grammar_detail.rule_summary_en}
            </Text>
          </View>
        )}

        {/* Example */}
        {grammar_detail.example_fi && (
          <View style={[styles.infoBox, styles.sectionSpacing]}>
            <Text style={styles.infoBoxTitleXs}>Example</Text>
            <Text style={styles.infoBoxExampleFi}>
              {grammar_detail.example_fi}
            </Text>
            <Text style={styles.infoBoxExampleEn}>
              {grammar_detail.example_translation_en}
            </Text>
          </View>
        )}

        {/* Footer Actions */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() =>
              onLearnMoreGrammar && onLearnMoreGrammar(grammar_detail)
            }
          >
            <BookOpen
              size={14}
              color={AppColors.blue600}
              style={styles.buttonIcon}
            />
            <Text style={styles.learnMoreButtonText}>Learn more</Text>
          </TouchableOpacity>
          {onSaveGrammar && (
            <TouchableOpacity
              style={[styles.saveButtonBase, styles.saveButtonGrammar]}
              onPress={() => onSaveGrammar(grammar_detail)}
            >
              <Save
                size={14}
                color={AppColors.amber800}
                style={styles.buttonIcon}
              />
              <Text
                style={[
                  styles.saveButtonTextBase,
                  styles.saveButtonTextGrammar
                ]}
              >
                Save to Notes
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </>
    )
  }

  let contentToRender = null
  if (contentMode === 'word') {
    contentToRender = renderWordDetails()
  } else if (contentMode === 'grammar') {
    contentToRender = renderGrammarDetails()
  }

  if (!isVisible && anim.__getValue() === 0) return null
  if (!popupPosition && isVisible) {
    // Safety check if visible but no position
    console.warn('Popup is visible but popupPosition is null. Hiding.')
    // onClose(); // This might cause a loop if isVisible is not set to false by parent immediately
    return null
  }

  if (!isMounted && !isVisible) return null

  // --- Positioning and Sizing Logic ---
  let calculatedTop = SCREEN_DIMENSIONS.height / 3 // Fallback if no popupPosition
  let calculatedLeft = SCREEN_DIMENSIONS.width / 2 - POPUP_DEFAULT_WIDTH / 2
  let calculatedWidth = POPUP_DEFAULT_WIDTH
  let calculatedContainerHeight: number | string = 'auto' // Height of the popup container
  let needsScroll = false

  if (popupPosition) {
    const targetScreenYTop = popupPosition.screenY
    const targetScreenYBottom = popupPosition.screenY + popupPosition.height
    const targetScreenXCenter = popupPosition.screenX + popupPosition.width / 2

    // Available space calculations
    let spaceAbove =
      targetScreenYTop -
      safeAreaInsets.top -
      POPUP_MARGIN_FROM_TARGET -
      SCREEN_EDGE_MARGIN
    let spaceBelow =
      SCREEN_DIMENSIONS.height -
      safeAreaInsets.bottom -
      targetScreenYBottom -
      POPUP_MARGIN_FROM_TARGET -
      SCREEN_EDGE_MARGIN

    // Attempt to subtract Android status bar height from pageY
    // This assumes measureInWindow on Android includes the status bar
    const statusBarHeight = StatusBar.currentHeight || 0
    spaceBelow -= statusBarHeight

    // Use the measured natural height of the content if available, otherwise estimate
    const currentEstimatedContentHeight =
      contentNaturalHeight || SCREEN_DIMENSIONS.height * 0.3 // Estimate if not measured

    let positionPreference: 'below' | 'above' =
      targetScreenYTop < SCREEN_DIMENSIONS.height / 2 ? 'below' : 'above'

    let availableHeightForPopup: number

    if (positionPreference === 'above' && spaceAbove >= 50) {
      // Prefer above if target is in bottom half & some space
      calculatedTop = targetScreenYTop - POPUP_MARGIN_FROM_TARGET // Anchor bottom of popup to top of target
      availableHeightForPopup = spaceAbove
      // Adjust 'top' if content height is known, to make bottom align with target's top
      if (contentNaturalHeight) {
        calculatedTop =
          targetScreenYTop -
          Math.min(contentNaturalHeight, availableHeightForPopup) -
          POPUP_MARGIN_FROM_TARGET
      }
    } else {
      // Default to below or if above doesn't have enough initial space
      calculatedTop = targetScreenYBottom + POPUP_MARGIN_FROM_TARGET
      availableHeightForPopup = spaceBelow
    }

    // Determine final container height and if scroll is needed
    if (contentNaturalHeight && contentNaturalHeight > 0) {
      if (contentNaturalHeight <= availableHeightForPopup) {
        calculatedContainerHeight = contentNaturalHeight // Fit content exactly
        needsScroll = false
      } else {
        calculatedContainerHeight = availableHeightForPopup // Constrain to available space
        needsScroll = true
      }
    } else {
      // Content not measured yet, or zero height content
      // Use available space but cap it to a reasonable default max, allow scroll if it might exceed
      calculatedContainerHeight = Math.min(
        availableHeightForPopup,
        SCREEN_DIMENSIONS.height * POPUP_MAX_HEIGHT_PERCENT
      )
      needsScroll = true // Assume scroll might be needed if content height is unknown
    }

    // Clamp top position
    calculatedTop = Math.max(
      calculatedTop,
      safeAreaInsets.top + SCREEN_EDGE_MARGIN
    )
    // Ensure bottom of popup (if its height is known) doesn't go off screen
    const finalPopupHeight =
      typeof calculatedContainerHeight === 'number'
        ? calculatedContainerHeight
        : SCREEN_DIMENSIONS.height * 0.3
    if (
      calculatedTop + finalPopupHeight >
      SCREEN_DIMENSIONS.height - safeAreaInsets.bottom - SCREEN_EDGE_MARGIN
    ) {
      calculatedTop =
        SCREEN_DIMENSIONS.height -
        safeAreaInsets.bottom -
        SCREEN_EDGE_MARGIN -
        finalPopupHeight
      // Re-clamp if this pushes it too high
      calculatedTop = Math.max(
        calculatedTop,
        safeAreaInsets.top + SCREEN_EDGE_MARGIN
      )
    }

    // Horizontal
    calculatedWidth = Math.min(
      POPUP_DEFAULT_WIDTH,
      SCREEN_DIMENSIONS.width * POPUP_MAX_WIDTH_PERCENT - 2 * SCREEN_EDGE_MARGIN
    )
    calculatedLeft = targetScreenXCenter - calculatedWidth / 2
    if (calculatedLeft < SCREEN_EDGE_MARGIN) calculatedLeft = SCREEN_EDGE_MARGIN
    if (
      calculatedLeft + calculatedWidth >
      SCREEN_DIMENSIONS.width - SCREEN_EDGE_MARGIN
    ) {
      calculatedLeft =
        SCREEN_DIMENSIONS.width - calculatedWidth - SCREEN_EDGE_MARGIN
    }
  }
  // --- End Positioning and Sizing Logic ---

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] })
      }
    ],
    position: 'absolute' as 'absolute',
    top: calculatedTop,
    left: calculatedLeft,
    width: calculatedWidth,
    height: calculatedContainerHeight // Apply calculated height (can be 'auto' or a number)
  }

  return (
    <Animated.View
      style={[
        styles.popupContainer,
        isDesktop && styles.wideScreenPopup,
        animatedStyle
      ]}
      onTouchEnd={e => e.stopPropagation()}
    >
      <CustomScrollView showScrollArrows={true} showScrollShadows={true}>
        <View
          onLayout={onActualContentLayout}
          style={styles.scrollContentContainerForScrollableView}
        >
          {/* Content is now directly rendered based on mode */}
          {contentToRender}
        </View>
      </CustomScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  popupContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 8, // rounded-lg
    shadowColor: AppColors.black, // shadow-lg
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Softer shadow
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: AppColors.gray200,
    overflow: 'hidden',
    zIndex: 3 // Ensure it's above article controls
  },
  wideScreenPopup: {
    // Example for isDesktop, can be adjusted
    width: POPUP_WIDTH * 1.2 // Slightly wider on "desktop"
  },
  scrollContentContainerForScrollableView: {
    padding: 16, // p-4
    paddingTop: 0
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12, // Padding for header
    paddingBottom: 8, // Padding for header
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray100,
    marginBottom: 12 // mb-3
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8, // gap-2
    flexShrink: 1 // Allow title to shrink if too long
  },
  titleText: {
    fontSize: 18, // text-lg
    fontWeight: 'bold', // font-bold
    color: AppColors.gray900
  },
  cefrBadge: {
    paddingHorizontal: 8, // px-2
    paddingVertical: 2, // py-0.5
    borderRadius: 9999 // rounded-full
  },
  cefrBadgeText: {
    fontSize: 12, // text-xs
    fontWeight: '500' // Tailwind default for such badges often implies medium
  },
  closeButton: {
    padding: 4 // For easier tap
  },
  sectionSpacing: {
    marginBottom: 12 // mb-3
  },
  // Text styles
  secondaryTextSm: {
    // e.g., part of speech, category
    fontSize: 14, // text-sm
    color: AppColors.gray500,
    marginBottom: 2
  },
  regularTextSm: {
    // e.g., translation
    fontSize: 14, // text-sm
    color: AppColors.gray700
  },
  fontMedium: {
    fontWeight: '500'
  },
  fontMono: {
    // For IPA
    // Ensure you have a monospace font in your project or use platform defaults
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },
  pronunciationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4 // mt-1
  },
  pronunciationButton: {
    marginLeft: 8 // ml-2
  },
  // Info Box (Word Form / Grammar Example)
  infoBox: {
    backgroundColor: AppColors.gray50,
    padding: 8, // p-2
    borderRadius: 6 // rounded-md
  },
  infoBoxTitle: {
    // For "Word Form"
    fontSize: 14, // text-sm
    fontWeight: '500',
    color: AppColors.gray700,
    marginBottom: 4 // mb-1
  },
  infoBoxTitleXs: {
    // For "Example" (Grammar)
    fontSize: 12, // text-xs
    fontWeight: '500',
    color: AppColors.gray700,
    marginBottom: 4 // mb-1
  },
  inflectionGrid: {
    // For Word Form details
    // Simulating grid cols-2, gap-1
    // No direct grid in RN, use flex or specific layout
  },
  inflectionItem: {
    flexDirection: 'row',
    marginBottom: 2
  },
  inflectionLabel: {
    fontSize: 12, // text-xs
    color: AppColors.gray500,
    marginRight: 4
  },
  inflectionValue: {
    fontSize: 12, // text-xs
    color: AppColors.gray700, // Text color for value
    fontWeight: '500'
  },
  infoBoxExampleFi: {
    // Grammar example FI
    fontSize: 14, // text-sm
    fontWeight: '500',
    color: AppColors.gray800
  },
  infoBoxExampleEn: {
    // Grammar example EN
    fontSize: 12, // text-xs
    color: AppColors.gray600,
    marginTop: 2 // mt-0.5
  },
  // Highlight Box (Grammar Original Phrase)
  highlightBoxAmber: {
    backgroundColor: AppColors.amber50,
    padding: 12, // p-3
    borderRadius: 6 // rounded-md
  },
  highlightBoxAmberTextPrimary: {
    fontSize: 14, // text-sm
    color: AppColors.amber800,
    fontWeight: '500'
  },
  highlightBoxAmberTextSecondary: {
    fontSize: 12, // text-xs
    color: AppColors.amber700,
    marginTop: 4 // mt-1
  },
  // Explanation / Rule Section
  subHeader: {
    // For "In This Context", "General Rule", "Explanation"
    fontSize: 14, // text-sm
    fontWeight: '500',
    color: AppColors.gray700,
    marginBottom: 4 // mb-1
  },
  paragraphText: {
    // For explanation text, rule summary
    fontSize: 14, // text-sm
    color: AppColors.gray600,
    lineHeight: 20
  },
  // Footer Actions
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16, // mt-4
    borderTopWidth: 1,
    borderTopColor: AppColors.gray100, // Added a subtle separator
    paddingTop: 12 // Added padding for separator
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, // Make tappable area decent
    paddingHorizontal: 2
  },
  learnMoreButtonText: {
    fontSize: 12, // text-xs
    color: AppColors.blue600,
    fontWeight: '500'
  },
  buttonIcon: {
    marginRight: 4 // mr-1 for learn more, gap-1 implies spacing for save
  },
  saveButtonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6, // py-1 (approx, 6 is more tappable)
    paddingHorizontal: 12, // px-3
    borderRadius: 9999 // rounded-full
  },
  saveButtonTextBase: {
    fontSize: 14, // text-sm
    fontWeight: '500',
    marginLeft: 4 // for gap-1
  },
  saveButtonWord: {
    backgroundColor: AppColors.blue100
  },
  saveButtonTextWord: {
    color: AppColors.blue800
  },
  saveButtonGrammar: {
    backgroundColor: AppColors.amber100
  },
  saveButtonTextGrammar: {
    color: AppColors.amber800
  }
})
