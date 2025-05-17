import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  UIManager,
  Pressable,
  StyleSheet as RNStyleSheet,
  findNodeHandle,
  Platform,
  StatusBar
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, X, Volume2 } from 'lucide-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'

import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { fetchSingleArticle } from '@features/articles/articlesActions'
import { AppDispatch, RootState } from '@store/store'
import { selectEntityById } from '@pagination/selectors'
import { useRequireAuthAction } from '@hooks/useRequireAuthAction'
import { format } from 'date-fns'
import { selectIsItemSaved } from '@features/savedItems/savedItemsSlice'
import {
  saveItemThunk,
  unsaveItemThunk
} from '@features/savedItems/savedItemsActions'
import { showAuthDebugToast } from '@lib/debugToast'
import { ArticleHeaderControls } from '@/components/reader/ArticleHeaderControls'
import { ArticleMetadataDisplay } from '@/components/reader/ArticleMetadataDisplay'
import { ArticleAudioPlayer } from '@/components/reader/ArticleAudioPlayer'
import { ArticleParagraphsList } from '@/components/reader/ArticleParagraphsList'
import { ArticleVocabularySection } from '@/components/reader/ArticleVocabularySection'
import { TranslationModal } from '@/components/reader/TranslationModal'
import {
  InteractiveDetailPopup,
  PopupContentMode
} from '@/components/reader/InteractiveDetailPopup' // New Popup
import {
  ArticleParagraph,
  WordOccurrence,
  GrammarOccurrence,
  BaseWordDetail,
  GrammarDetail // Import types
} from '@features/articles/types'
import { useRefresh } from '@hooks/useRefresh'
import { RefreshControl } from 'react-native'

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const insets = useSafeAreaInsets()

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

  // State for the new InteractiveDetailPopup
  const [popupVisible, setPopupVisible] = useState(false)
  const [popupContentMode, setPopupContentMode] =
    useState<PopupContentMode>(null)
  const [currentWordOccForPopup, setCurrentWordOccForPopup] =
    useState<WordOccurrence | null>(null)
  const [currentGrammarOccForPopup, setCurrentGrammarOccForPopup] =
    useState<GrammarOccurrence | null>(null)
  const [focusedOccurrenceId, setFocusedOccurrenceId] = useState<string | null>(
    null
  )

  const [popupPosition, setPopupPosition] = useState<{
    screenY: number
    screenX: number
    width: number
    height: number
  } | null>(null)
  const [isScrollLocked, setIsScrollLocked] = useState(false)

  const scrollViewRef = useRef<ScrollView>(null)

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
      await dispatch(saveItemThunk({ item_type: itemType, item_id: itemId }))
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
      await dispatch(unsaveItemThunk({ item_type: itemType, item_id: itemId }))
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

  const showPopupForOccurrence = useCallback(
    (
      layout: {
        pageX: number
        pageY: number
        width: number
        height: number
      } | null,
      mode: 'word' | 'grammar',
      occurrenceId: string
    ) => {
      if (layout && (layout.width > 0 || layout.height > 0)) {
        let finalPageY = layout.pageY
        let finalPageX = layout.pageX

        // Attempt to subtract Android status bar height from pageY
        // This assumes measureInWindow on Android includes the status bar
        const statusBarHeight = StatusBar.currentHeight || 0
        finalPageY += statusBarHeight

        // It's also possible iOS includes safeArea.top in its pageY and Android doesn't,
        // or vice-versa. This requires more experimentation.
        // For now, let's focus on the Android status bar.

        const newPopupPosition = {
          screenY: finalPageY,
          screenX: finalPageX,
          width: layout.width,
          height: layout.height
        }

        setPopupPosition(newPopupPosition)
        setPopupContentMode(mode)
        setFocusedOccurrenceId(occurrenceId)
        setPopupVisible(true)
        setIsScrollLocked(true)
      } else {
        console.warn('Could not get layout for popup.')
        // Fallback or do nothing
      }
    },
    []
  )

  const handleWordSelect = useCallback(
    (
      occurrence: WordOccurrence,
      paragraph: ArticleParagraph,
      layout: {
        pageX: number
        pageY: number
        width: number
        height: number
      } | null
    ) => {
      setCurrentWordOccForPopup(occurrence)
      setCurrentGrammarOccForPopup(null)
      showPopupForOccurrence(layout, 'word', occurrence.occurrence_id)
    },
    [showPopupForOccurrence]
  )

  const handleGrammarSelect = useCallback(
    (
      occurrence: GrammarOccurrence,
      paragraph: ArticleParagraph,
      layout: {
        pageX: number
        pageY: number
        width: number
        height: number
      } | null
    ) => {
      setCurrentWordOccForPopup(null)
      setCurrentGrammarOccForPopup(occurrence)
      showPopupForOccurrence(layout, 'grammar', occurrence.occurrence_id)
    },
    [showPopupForOccurrence]
  )

  const handleClosePopup = useCallback(() => {
    setPopupVisible(false)
    setFocusedOccurrenceId(null)
    setPopupPosition(null)
    setIsScrollLocked(false)
    // Optional: Delay resetting data if needed for animations, but usually not necessary
    // if the popup correctly handles null data.
    // setCurrentWordOccForPopup(null);
  }, [])

  const saveWordAction = useCallback(
    (baseWord: BaseWordDetail) => {
      // TODO: Implement actual saving logic. This might involve:

      console.log(
        'Save Word action triggered for:',
        baseWord.word_fi,
        baseWord.base_word_id
      )
      showAuthDebugToast('info', 'Save Word', `Word: ${baseWord.word_fi}`)
      // dispatch(addWordToVocabularyThunk(baseWord.base_word_id, ...));
      // handleClosePopup(); // Or let user close manually
    },
    [handleClosePopup]
  )

  const handleSaveWord = useRequireAuthAction(
    saveWordAction,
    'Login to save vocabulary.'
  )

  const saveGrammarAction = useCallback(
    (grammarItem: GrammarDetail) => {
      console.log(
        'Save Grammar action triggered for:',
        grammarItem.name_en,
        grammarItem.grammar_id
      )
      showAuthDebugToast(
        'info',
        'Save Grammar Note',
        `Note: ${grammarItem.name_en}`
      )
      // dispatch(addGrammarNoteThunk(grammarItem.grammar_id, ...));
      // handleClosePopup();
    },
    [handleClosePopup]
  )
  const handleSaveGrammar = useRequireAuthAction(
    saveGrammarAction,
    'Login to save grammar notes.'
  )

  const handleBrandPress = () => {
    // Future implementation:
    // router.push({ pathname: '/(main)/brand/[id]', params: { id: article.brand.source_identifier } });
    alert(`Brand page for ${article?.brand?.display_name} not implemented yet.`)
  }

  const handleShare = () => {
    // TODO: Implement actual sharing logic (e.g., using Share from react-native)
    alert('Share action not implemented')
  }

  const handlePlayArticleAudio = () => {
    // TODO: Implement actual audio playback logic for the full article
    alert('Full article audio playback not implemented yet.')
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
            styles.articleHeaderControlsContainer,
            { top: insets.top } // Position below status bar
          ]}
        >
          <ArticleHeaderControls
            onGoBack={handleGoBack}
            onToggleSave={handleToggleSave}
            onShare={handleShare} // Pass the new handler
            isSaveLoading={isSaveLoading || !itemId} // Combined disabled state
            isArticleSaved={isOptimisticallySaved}
            isDesktop={isDesktop}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
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
            <ArticleMetadataDisplay
              article={article}
              publicationDateFormatted={publicationDateFormatted}
              onBrandPress={handleBrandPress}
              isDesktop={isDesktop}
            />

            {article?.id && (
              <ArticleAudioPlayer
                articleId={article.id}
                onPlayPress={handlePlayArticleAudio}
              />
            )}

            <ArticleParagraphsList
              paragraphs={article?.paragraphs}
              onWordSelect={handleWordSelect}
              onGrammarSelect={handleGrammarSelect}
              focusedOccurrenceId={focusedOccurrenceId}
            />
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                Source: {article?.brand?.display_name || 'Unknown Source'}
              </Text>
            </View>
          </View>

          <ArticleVocabularySection
            vocabulary={article?.vocabulary}
            isDesktop={isDesktop}
          />
        </ScrollView>

        {/* Click-outside catcher and Popup */}
        {popupVisible && (
          <>
            <Pressable
              style={RNStyleSheet.absoluteFill} // Covers the whole screen
              onPress={handleClosePopup}
              accessibilityLabel="Close popup"
              accessibilityRole="button"
            />
            {/* Render specific popup based on contentMode */}
            {currentWordOccForPopup && popupContentMode === 'word' && (
              <InteractiveDetailPopup
                isVisible={popupVisible} // Controls animation within popup
                contentMode={popupContentMode}
                wordOccurrenceData={currentWordOccForPopup}
                grammarOccurrenceData={null}
                popupPosition={popupPosition}
                onClose={handleClosePopup}
                onSaveWord={handleSaveWord}
                isDesktop={isDesktop}
              />
            )}
            {currentGrammarOccForPopup && popupContentMode === 'grammar' && (
              <InteractiveDetailPopup
                isVisible={popupVisible}
                contentMode={popupContentMode}
                wordOccurrenceData={null}
                grammarOccurrenceData={currentGrammarOccForPopup}
                popupPosition={popupPosition}
                onClose={handleClosePopup}
                onSaveGrammar={handleSaveGrammar}
                isDesktop={isDesktop}
              />
            )}
          </>
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
    paddingBottom: 40, // Ensure space at the bottom
    zIndex: 1
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
  articleHeaderControlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 3
  },
  articleContainer: {
    padding: 20,
    backgroundColor: Colors.light.background,
    marginTop: 40, // Pull content up slightly over image bottom
    zIndex: 1 // Ensure content is above image if overlap occurs
  },
  wideScreenArticleContainer: {
    // This style applies to the main content container in ArticleScreen
    maxWidth: 760, // Max width for the content area on desktop
    width: '100%',
    borderRadius: 0, // No rounding needed if not visually distinct from background
    paddingTop: 20 // Add padding at the top if marginTop is 0
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
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8
  },
  audioDuration: {
    backgroundColor: Colors.light.backgroundLight,
    marginBottom: 24
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
  }
})
