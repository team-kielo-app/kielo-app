import React, { useRef, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform
} from 'react-native'
import { X, Volume2 } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { ArticleParagraph } from '@features/articles/types' // Your paragraph type

interface TranslationModalProps {
  isVisible: boolean
  selectedParagraph: ArticleParagraph | null
  onClose: () => void
  onSaveVocabulary: (paragraphText: string, translationText: string) => void // More specific
  onPlayAudioSelection?: (text: string) => void // Optional: if you want to play selected text
  isDesktop?: boolean
}

const MODAL_ANIMATION_DURATION = 300
const MODAL_CLOSE_DURATION = 200

export const TranslationModal: React.FC<TranslationModalProps> = ({
  isVisible,
  selectedParagraph,
  onClose,
  onSaveVocabulary,
  onPlayAudioSelection,
  isDesktop = false
}) => {
  const translateAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible && selectedParagraph) {
      Animated.timing(translateAnimation, {
        toValue: 1,
        duration: MODAL_ANIMATION_DURATION,
        useNativeDriver: true
      }).start()
    } else {
      // This handles initial state or when isVisible becomes false externally
      // The onClose prop itself will also trigger this if called via the X button
      Animated.timing(translateAnimation, {
        toValue: 0,
        duration: MODAL_CLOSE_DURATION,
        useNativeDriver: true
      }).start()
    }
  }, [isVisible, selectedParagraph, translateAnimation])

  const translateY = translateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Dimensions.get('window').height * 0.6, 0] // Animate from bottom
  })

  const handleInternalClose = useCallback(() => {
    // Animate out then call onClose prop
    Animated.timing(translateAnimation, {
      toValue: 0,
      duration: MODAL_CLOSE_DURATION,
      useNativeDriver: true
    }).start(() => {
      onClose()
    })
  }, [translateAnimation, onClose])

  const handleSave = useCallback(() => {
    if (selectedParagraph) {
      onSaveVocabulary(
        selectedParagraph.original_text_fi,
        selectedParagraph.translation_en
      )
      // Optionally close after saving, or let parent decide
      // handleInternalClose();
    }
  }, [selectedParagraph, onSaveVocabulary])

  const handlePlayAudio = useCallback(() => {
    if (selectedParagraph && onPlayAudioSelection) {
      onPlayAudioSelection(selectedParagraph.original_text_fi)
    } else if (selectedParagraph) {
      alert(
        `Play audio for: "${selectedParagraph.original_text_fi}" (Not Implemented)`
      )
    }
  }, [selectedParagraph, onPlayAudioSelection])

  if (!isVisible || !selectedParagraph) {
    return null // Don't render if not visible or no paragraph selected
  }

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity
        style={styles.modalBackdrop}
        onPress={handleInternalClose}
        activeOpacity={1} // Full opacity backdrop
      />
      <Animated.View
        style={[
          styles.translationModal,
          { transform: [{ translateY }] },
          isDesktop && styles.wideScreenModal
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Translate</Text>
          <TouchableOpacity
            onPress={handleInternalClose}
            accessibilityLabel="Close translation modal"
          >
            <X size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          // showsVerticalScrollIndicator={true}
          bounces={false}
          style={styles.modalContentScroll}
        >
          <View style={styles.originalTextContainer}>
            <Text style={styles.originalText}>
              {selectedParagraph.original_text_fi}
            </Text>
            <TouchableOpacity
              style={styles.audioButton}
              onPress={handlePlayAudio}
              accessibilityLabel="Play original text audio"
            >
              <Volume2 size={18} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.translationContainer}>
            <Text style={styles.translationText}>
              {selectedParagraph.translation_en}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSave}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>Save to Vocabulary</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  )
}

// Styles are copied and adapted from ArticleScreen.tsx
const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center'
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Moved to backdrop
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  translationModal: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Adjust padding for different OS
    width: '100%',
    maxHeight: '60%', // Max height of the modal
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10 // For Android shadow
  },
  wideScreenModal: {
    maxWidth: 600, // Max width on desktop
    borderRadius: 16, // Round all corners on desktop
    marginBottom: 40, // Margin from bottom on desktop
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingBottom: 10
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  modalContentScroll: {
    flexGrow: 0 // Prevent ScrollView from taking all available height inside the maxHeight modal
  },
  originalTextContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  originalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
    lineHeight: 24
  },
  translationContainer: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 60
  },
  translationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24
  },
  audioButton: {
    padding: 4 // Hit area
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10, // Add some space above the button
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    marginTop: 'auto' // Push actions to the bottom if content is short
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Make button take available width in its container
    maxWidth: 300, // Max width for the button
    alignSelf: 'center'
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.white
  }
})
