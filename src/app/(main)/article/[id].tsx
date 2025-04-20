import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Animated,
  ActivityIndicator
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ArrowLeft,
  Bookmark,
  Share,
  BookmarkCheck,
  X,
  PlayCircle,
  Volume2
} from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'

import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { fetchSingleArticle } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectEntityById } from '@pagination/selectors'
import { selectIsAuthenticated } from '@features/auth/authSelectors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()

  const article = useSelector((state: RootState) =>
    selectEntityById('articles', id)(state)
  )

  useEffect(() => {
    if (id && (!article || !article?.content)) {
      dispatch(fetchSingleArticle(id))
    }
  }, [id, dispatch])

  const [isSavedLocally, setIsSavedLocally] = useState(false)
  const [selectedText, setSelectedText] = useState<null | string>(null)
  const [translationModalVisible, setTranslationModalVisible] = useState(false)
  const translateAnimation = useRef(new Animated.Value(0)).current

  const handleGoBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(main)/(tabs)/reader')
  }

  const saveArticleAction = () => {
    /* ... */ setIsSavedLocally(true)
  }
  const unsaveArticleAction = () => {
    /* ... */ setIsSavedLocally(false)
  }
  const handleToggleSave = useRequireAuthAction(() => {
    if (isSavedLocally) unsaveArticleAction()
    else saveArticleAction()
  }, 'Login to save this article?.')

  const handleTextSelection = (text: string) => {
    setSelectedText(text)
    setTranslationModalVisible(true)
    Animated.timing(translateAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }
  const closeTranslationModal = () => {
    Animated.timing(translateAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setTranslationModalVisible(false)
      setSelectedText(null)
    })
  }
  const translateY = translateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0]
  })

  const saveVocabularyAction = (word: string) => {
    /* ... */ closeTranslationModal()
  }
  const handleSaveVocabulary = useRequireAuthAction(
    saveVocabularyAction,
    'Login to save vocabulary.'
  )

  if (!article && !id) {
    /* ... Error handling ... */
  }
  if (!article) {
    /* ... Loading state ... */
  }

  const paragraphs =
    typeof article?.content === 'string'
      ? [article?.content]
      : article?.content || []

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          // showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.wideScreenContent
          ]}
        >
          {/* Header Image & Controls */}
          <View style={styles.headerImageContainer}>
            <Image
              source={{ uri: article?.imageUrl }}
              style={styles.headerImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.headerGradient}
            />
            <View style={styles.articleHeaderControls}>
              <TouchableOpacity
                style={styles.backButtonContainer}
                onPress={handleGoBack}
              >
                <ArrowLeft size={22} color={Colors.light.white} />
              </TouchableOpacity>
              <View style={styles.headerRightButtons}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleToggleSave}
                >
                  {isSavedLocally ? (
                    <BookmarkCheck size={22} color={Colors.light.white} />
                  ) : (
                    <Bookmark size={22} color={Colors.light.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => alert('Share action not implemented')}
                >
                  <Share size={22} color={Colors.light.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Article Content Area */}
          <View
            style={[
              styles.articleContainer,
              isDesktop && styles.wideScreenArticleContainer
            ]}
          >
            <View style={styles.articleMetadata}>
              <Text style={styles.articleCategory}>
                {article?.category?.toUpperCase()}
              </Text>
              <Text style={styles.articleDate}>{article?.date}</Text>
            </View>
            <Text style={styles.articleTitle}>{article?.title}</Text>
            <Text style={styles.articleSubtitle}>{article?.subtitle}</Text>

            {/* Optional Audio Player */}
            <TouchableOpacity
              style={styles.audioPlayerContainer}
              onPress={() => alert('Audio Player (Not Implemented)')}
            >
              <View style={styles.audioPlayerContent}>
                <PlayCircle size={24} color={Colors.light.primary} />
                <Text style={styles.audioPlayerText}>Listen to Article</Text>
              </View>
              <View style={styles.audioDuration}>
                <Text style={styles.audioDurationText}>4:32</Text>
              </View>
            </TouchableOpacity>

            {/* Paragraphs */}
            <View style={styles.articleContent}>
              {paragraphs.map((paragraph, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTextSelection(paragraph)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.paragraph}>{paragraph}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>Source: {article?.source}</Text>
            </View>
          </View>

          {/* Vocabulary Section */}
          {article?.vocabulary && article?.vocabulary.length > 0 && (
            <View
              style={[
                styles.vocabularySection,
                isDesktop && styles.wideScreenVocabularySection
              ]}
            >
              <Text style={styles.vocabularySectionTitle}>Key Vocabulary</Text>
              {article?.vocabulary.map((item, index) => (
                <View key={index} style={styles.vocabularyItem}>
                  <View style={styles.vocabularyWord}>
                    <Text style={styles.finnishWord}>{item.word}</Text>
                    <TouchableOpacity
                      style={styles.audioButton}
                      onPress={() => alert(`Play audio for ${item.word}`)}
                    >
                      <Volume2 size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.englishTranslation}>
                    {item.translation}
                  </Text>
                  <Text style={styles.exampleText}>"{item.example}"</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Translation Modal */}
        {translationModalVisible && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={closeTranslationModal}
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
                <TouchableOpacity onPress={closeTranslationModal}>
                  <X size={20} color={Colors.light.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.originalTextContainer}>
                <Text style={styles.originalText}>{selectedText}</Text>
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => alert(`Play audio for selection`)}
                >
                  <Volume2 size={18} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.translationContainer}>
                <Text style={styles.translationText}>
                  [Translation would appear here]
                </Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSaveVocabulary(selectedText || '')}
                >
                  <Text style={styles.actionButtonText}>
                    Save to Vocabulary
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}
      </SafeAreaView>
    </>
  )
}

// Styles filled from original file
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 16
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40 // Ensure space at the bottom
  },
  wideScreenContent: {
    alignItems: 'center'
  },
  headerImageContainer: {
    position: 'relative',
    height: 250,
    width: '100%'
  },
  headerImage: {
    width: '100%',
    height: '100%'
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100
  },
  articleHeaderControls: {
    position: 'absolute',
    top: 0, // Adjust based on SafeAreaView top inset if needed
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40 // Add padding top to account for status bar/notch on mobile
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12 // Use gap for spacing
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
    // marginLeft: 12, // Use gap instead
  },
  articleContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
    marginTop: -20, // Pull content up slightly over image bottom
    borderTopLeftRadius: 20, // Rounded corners
    borderTopRightRadius: 20,
    zIndex: 1 // Ensure content is above image if overlap occurs
  },
  wideScreenArticleContainer: {
    maxWidth: 760,
    width: '100%',
    marginTop: 0, // No overlap needed on wide screen
    borderRadius: 0
  },
  articleMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 10 // Add margin after pulling up
  },
  articleCategory: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.primary
  },
  articleDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  },
  articleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: Colors.light.text,
    marginBottom: 8,
    lineHeight: 32
  },
  articleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 24
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  audioPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  audioPlayerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8
  },
  audioDuration: {
    backgroundColor: Colors.light.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  audioDurationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.textSecondary
  },
  articleContent: {
    marginBottom: 24
  },
  paragraph: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 26, // Slightly increase line height for readability
    marginBottom: 16
  },
  sourceContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16
  },
  sourceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic'
  },
  vocabularySection: {
    padding: 20,
    backgroundColor: Colors.light.cardBackground
    // borderTopWidth: 1, // Removed top border for cleaner look
    // borderTopColor: Colors.light.border,
  },
  wideScreenVocabularySection: {
    maxWidth: 760,
    width: '100%',
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
    borderTopWidth: 0, // Ensure no top border on wide screen either
    padding: 20 // Ensure padding on wide screen
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
    borderBottomColor: Colors.light.border,
    // Remove border from last item
    '&:last-child': {
      borderBottomWidth: 0,
      marginBottom: 0,
      paddingBottom: 0
    }
  },
  vocabularyWord: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    justifyContent: 'space-between' // Space out word and button
  },
  finnishWord: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginRight: 8,
    flexShrink: 1 // Allow word to wrap
  },
  audioButton: {
    padding: 4
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
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end', // Modal appears at bottom
    alignItems: 'center'
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
    padding: 20,
    paddingBottom: 30, // Add padding at the bottom
    width: '100%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10
  },
  wideScreenModal: {
    maxWidth: 600,
    borderRadius: 16,
    marginBottom: 40 // Add margin from bottom on wide screens
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1, // Add separator
    borderBottomColor: Colors.light.border,
    paddingBottom: 10
  },
  modalTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  originalTextContainer: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to top for multi-line text
    justifyContent: 'space-between' // Space out text and button
  },
  originalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    flex: 1, // Allow text to take space
    marginRight: 8,
    lineHeight: 24
  },
  translationContainer: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 60 // Ensure some minimum height
  },
  translationText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center' // Center button
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Make button take full width
    maxWidth: 300, // Max width for button
    alignSelf: 'center'
  },
  actionButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: Colors.light.white
  }
})
