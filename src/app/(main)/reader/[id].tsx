import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Pressable,
  ActivityIndicator
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { format } from 'date-fns'
import { ParagraphRenderer } from '@components/ParagraphRenderer'
import { selectIsItemSaved } from '@features/savedItems/savedItemsSlice' // Import selector
import {
  saveItemThunk,
  unsaveItemThunk
} from '@features/savedItems/savedItemsActions' // Import actions
import { showAuthDebugToast } from '@lib/debugToast'
import { useRefresh } from '@hooks/useRefresh' // --- Import useRefresh ---
import { RefreshControl } from 'react-native'

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()

  const [isFetching, setIsFetching] = useState(false)

  const article = useSelector((state: RootState) =>
    selectEntityById('articles', id)(state)
  )

  const publicationDateFormatted = useMemo(() => {
    if (!article?.publication_date) return ''
    return format(new Date(article.publication_date), 'MMMM dd, yyyy')
  }, [article?.publication_date])

  useEffect(() => {
    if (isFetching) return

    if (id && (!article || !article?.paragraphs)) {
      setIsFetching(true)
      dispatch(fetchSingleArticle(id, () => setIsFetching(false)))
    }
  }, [id, dispatch])

  const handleRefreshAction = React.useCallback(() => {
    if (!id) {
      console.warn('Cannot refresh, article ID is missing.')
      return Promise.resolve()
    }
    console.log(`Dispatching fetchSingleArticle for refresh, ID: ${id}`)
    setIsFetching(true)
    return dispatch(fetchSingleArticle(id, () => setIsFetching(false)))
  }, [dispatch, id])

  const [isRefreshing, handleRefresh] = useRefresh(handleRefreshAction)

  const [isSavedLocally, setIsSavedLocally] = useState(false)
  const [selectedParagraph, setSelectedParagraph] = useState<null | object>(
    null
  )
  const translateAnimation = useRef(new Animated.Value(0)).current

  const handleGoBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(main)/(tabs)/reader')
  }

  const itemType = 'ArticleVersion' // Define the type for this screen
  const itemId = id || '' // Ensure we have an ID

  // Get saved status from Redux store
  const isSavedInStore = useSelector((state: RootState) =>
    selectIsItemSaved(state, itemType, itemId)
  )
  // Local state for immediate UI feedback (optimistic update) and button loading
  const [isOptimisticallySaved, setIsOptimisticallySaved] =
    useState(isSavedInStore)
  const [isSaveLoading, setIsSaveLoading] = useState(false)

  // Sync local optimistic state if the store changes (e.g., after list fetch)
  useEffect(() => {
    setIsOptimisticallySaved(isSavedInStore)
  }, [isSavedInStore])

  const handleSave = async () => {
    if (!itemId) return
    setIsSaveLoading(true)
    setIsOptimisticallySaved(true) // Optimistic update
    showAuthDebugToast('info', 'Saving article...')
    try {
      await dispatch(
        saveItemThunk({ item_type: itemType, item_id: itemId })
      ).unwrap()
      showAuthDebugToast('success', 'Article Saved')
      // No need to setIsOptimisticallySaved(true) again, store will update eventually
    } catch (err: any) {
      console.error('Save failed:', err)
      showAuthDebugToast(
        'error',
        'Save Failed',
        err?.message || 'Could not save article.'
      )
      setIsOptimisticallySaved(false) // Revert optimistic update on error
    } finally {
      setIsSaveLoading(false)
    }
  }

  const handleUnsave = async () => {
    if (!itemId) return
    setIsSaveLoading(true)
    setIsOptimisticallySaved(false) // Optimistic update
    showAuthDebugToast('info', 'Unsacing article...')
    try {
      await dispatch(
        unsaveItemThunk({ item_type: itemType, item_id: itemId })
      ).unwrap()
      showAuthDebugToast('success', 'Article Unsaved')
      // Reducer handles removing from list, selector will update
    } catch (err: any) {
      console.error('Unsave failed:', err)
      showAuthDebugToast(
        'error',
        'Unsave Failed',
        err?.message || 'Could not unsave article.'
      )
      setIsOptimisticallySaved(true) // Revert optimistic update on error
    } finally {
      setIsSaveLoading(false)
    }
  }

  const handleToggleSave = useRequireAuthAction(() => {
    if (isOptimisticallySaved) {
      // Check optimistic state for action
      handleUnsave()
    } else {
      handleSave()
    }
  }, 'Login to save this article?.')

  const handleTextSelection = (paragraph: object) => {
    if (!paragraph.translation_en) return

    setSelectedParagraph(paragraph)
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
      setSelectedParagraph(null)
    })
  }
  const translateY = translateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0]
  })

  const saveVocabularyAction = (word: string) => {
    closeTranslationModal()
  }
  const handleSaveVocabulary = useRequireAuthAction(
    saveVocabularyAction,
    'Login to save vocabulary.'
  )

  const handleBrandPress = () => {
    // Future implementation:
    // router.push({ pathname: '/(main)/brand/[id]', params: { id: article.brand.source_identifier } });
    alert(`Brand page for ${article?.brand?.display_name} not implemented yet.`)
  }
  const isLoadingArticle = isFetching && !article

  if (isLoadingArticle) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    )
  }

  // Handle case where article fetch failed or ID is invalid
  if (!article && !isFetching) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.errorBackButton}
          >
            <ArrowLeft size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.errorText}>Failed to load article.</Text>
          <TouchableOpacity onPress={handleRefreshAction}>
            <Text style={styles.errorRetry}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Handle case where article might not exist (e.g., bad ID) even if not explicitly 'failed'
  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.errorBackButton}
          >
            <ArrowLeft size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.errorText}>Article not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View
          style={[
            styles.articleHeaderControls,
            isDesktop
              ? styles.wideScreenHeaderControls
              : styles.mobileHeaderControls
          ]}
        >
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
              disabled={isSaveLoading || !itemId} // Disable while loading or if no ID
            >
              {isSaveLoading ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
              ) : isOptimisticallySaved ? ( // Use optimistic state for icon
                <BookmarkCheck size={22} color={Colors.light.primary} /> // Indicate saved
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

        <ScrollView
          // showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.wideScreenContent
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.25)', 'transparent']}
            style={styles.headerGradient}
          />

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
            {article?.subtitle && (
              <Text style={styles.articleSubtitle}>{article.subtitle}</Text>
            )}

            <View style={styles.tagsContainer}>
              {article?.tags &&
                article?.tags?.map(tag => (
                  <Text key={tag} style={styles.tag}>
                    {tag}
                  </Text>
                ))}
            </View>

            <View style={styles.metaContainer}>
              <Pressable onPress={handleBrandPress}>
                <Text style={styles.brand}>{article?.brand?.display_name}</Text>
              </Pressable>
              <Text style={styles.date}>{publicationDateFormatted}</Text>
            </View>

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
              {article?.paragraphs &&
                article.paragraphs
                  .sort((a, b) => a.paragraph_index - b.paragraph_index)
                  .map(paragraph => (
                    <ParagraphRenderer
                      key={paragraph.paragraph_id || paragraph.paragraph_index}
                      paragraph={paragraph}
                      onShowTranslation={() => handleTextSelection(paragraph)}
                    />
                  ))}
            </View>
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                Source: {article?.brand?.display_name}
              </Text>
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
        {selectedParagraph && (
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

              <ScrollView showsVerticalScrollIndicator={true} bounces={false}>
                <View style={styles.originalTextContainer}>
                  <Text style={styles.originalText}>
                    {selectedParagraph.original_text_fi}
                  </Text>
                  <TouchableOpacity
                    style={styles.audioButton}
                    onPress={() => alert(`Play audio for selection`)}
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
                  onPress={() => handleSaveVocabulary(selectedParagraph || '')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 2
  },
  articleHeaderControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    zIndex: 3
  },
  mobileHeaderControls: {
    marginTop: 50
  },
  wideScreenHeaderControls: {
    marginTop: 10,
    marginHorizontal: 20
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12 // Use gap for spacing
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)'
    // marginLeft: 12, // Use gap instead
  },
  articleContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
    marginTop: 40, // Pull content up slightly over image bottom
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
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10 // Spacing between brand and date
  },
  brand: {
    fontSize: 15,
    paddingVertical: 8,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.primary // Or brand color
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 6
  },
  tag: {
    backgroundColor: Colors.light.backgroundLight,
    color: Colors.light.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden', // Ensure text respects padding
    fontFamily: 'Inter-Medium'
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
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flex: 1,
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
    marginBottom: 6,
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
