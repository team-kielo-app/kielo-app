import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StatusBar,
  RefreshControl,
  Platform,
  Alert
} from 'react-native'
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useSelector, useDispatch } from 'react-redux'

import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'
import { AppDispatch, RootState } from '@store/store'
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
import {
  InteractiveDetailPopup,
  PopupContentMode
} from '@/components/reader/InteractiveDetailPopup'
import {
  ArticleParagraph,
  WordOccurrence,
  GrammarOccurrence,
  BaseWordDetail,
  GrammarDetail,
  Article
} from '@features/articles/types'
import { useRefresh } from '@hooks/useRefresh'
import { useEntity } from '@/hooks/useEntity'
import { ARTICLE_SCHEMA_SINGLE } from '@entities/schemas'
import { fetchEntityByIdIfNeededThunk } from '@/features/entities/entityActions'
import { ArrowLeft } from 'lucide-react-native'

export default function ArticleScreen(): React.ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isDesktop } = useResponsiveDimensions()
  const insets = useSafeAreaInsets()

  const [hasAttemptedFullFetch, setHasAttemptedFullFetch] = useState(false)

  const {
    data: article,
    isLoading: isLoadingArticleEntity,
    error: articleEntityError
  } = useEntity<Article>(
    'articles',
    id,
    ARTICLE_SCHEMA_SINGLE,
    articleId => `/news/articles/${articleId}`,
    {
      fetchPolicy: 'cache-first'
    }
  )

  useEffect(() => {
    if (!id || !dispatch) return

    if (
      article &&
      (!article.paragraphs || article.paragraphs.length === 0) &&
      !hasAttemptedFullFetch &&
      !isLoadingArticleEntity
    ) {
      console.log(
        `Article ${id} is in cache but seems incomplete (no paragraphs). Forcing full fetch.`
      )
      setHasAttemptedFullFetch(true)
      dispatch(
        fetchEntityByIdIfNeededThunk({
          entityType: 'articles',
          id,
          endpoint: `/news/articles/${id}`,
          schema: ARTICLE_SCHEMA_SINGLE,
          forceRefresh: true
        })
      )
    } else if (
      !article &&
      !isLoadingArticleEntity &&
      !articleEntityError &&
      !hasAttemptedFullFetch
    ) {
      console.log(
        `Article ${id} not in cache. Triggering initial fetch via useEntity (or forced if needed).`
      )
      setHasAttemptedFullFetch(true)
      dispatch(
        fetchEntityByIdIfNeededThunk({
          entityType: 'articles',
          id,
          endpoint: `/news/articles/${id}`,
          schema: ARTICLE_SCHEMA_SINGLE,
          forceRefresh: true
        })
      )
    }
  }, [
    id,
    article,
    dispatch,
    hasAttemptedFullFetch,
    isLoadingArticleEntity,
    articleEntityError
  ])

  const handleRefreshAction = useCallback(() => {
    if (!id) return Promise.resolve()
    setHasAttemptedFullFetch(true)
    return dispatch(
      fetchEntityByIdIfNeededThunk({
        entityType: 'articles',
        id,
        endpoint: `/news/articles/${id}`,
        schema: ARTICLE_SCHEMA_SINGLE,
        forceRefresh: true
      })
    )
  }, [dispatch, id])

  const [isPullRefreshing, handlePullRefresh] = useRefresh(handleRefreshAction)

  const publicationDateFormatted = useMemo(() => {
    if (!article?.publication_date) return ''
    return format(new Date(article.publication_date), 'MMMM dd, yyyy')
  }, [article?.publication_date])

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
  const [popupPositionInternal, setPopupPositionInternal] = useState<{
    screenX: number
    screenY: number
    width: number
    height: number
  } | null>(null)
  const scrollViewRef = useRef<ScrollView>(null)

  const handleGoBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace('/(main)/(tabs)/reader')
  }
  const itemType = 'ArticleVersion'
  const itemId = id || ''
  const isSavedInStore = useSelector((state: RootState) =>
    selectIsItemSaved(state, itemType, itemId)
  )
  const [isOptimisticallySaved, setIsOptimisticallySaved] =
    useState(isSavedInStore)
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  useEffect(() => {
    setIsOptimisticallySaved(isSavedInStore)
  }, [isSavedInStore])
  const handleSave = async () => {
    if (!itemId) return
    setIsSaveLoading(true)
    setIsOptimisticallySaved(true)
    showAuthDebugToast('info', 'Saving article...')
    try {
      await dispatch(saveItemThunk({ item_type: itemType, item_id: itemId }))
      showAuthDebugToast('success', 'Article Saved')
    } catch (err: any) {
      console.error('Save failed:', err)
      showAuthDebugToast(
        'error',
        'Save Failed',
        err?.message || 'Could not save article.'
      )
      setIsOptimisticallySaved(false)
    } finally {
      setIsSaveLoading(false)
    }
  }

  const handleUnsave = async () => {
    if (!itemId) return
    setIsSaveLoading(true)
    setIsOptimisticallySaved(false)
    showAuthDebugToast('info', 'Unsacing article...')
    try {
      await dispatch(unsaveItemThunk({ item_type: itemType, item_id: itemId }))
      showAuthDebugToast('success', 'Article Unsaved')
    } catch (err: any) {
      console.error('Unsave failed:', err)
      showAuthDebugToast(
        'error',
        'Unsave Failed',
        err?.message || 'Could not unsave article.'
      )
      setIsOptimisticallySaved(true)
    } finally {
      setIsSaveLoading(false)
    }
  }
  const handleToggleSave = useRequireAuthAction(() => {
    if (isOptimisticallySaved) {
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
        console.log(
          `Showing popup for ${mode} occurrence ${occurrenceId} at position:`,
          layout
        )
        // Attempt to subtract Android status bar height from pageY
        // This assumes measureInWindow on Android includes the status bar
        const statusBarHeight = StatusBar.currentHeight || 0

        // It's also possible iOS includes safeArea.top in its pageY and Android doesn't,
        // or vice-versa. This requires more experimentation.
        // For now, let's focus on the Android status bar.

        setPopupPositionInternal({
          screenX: layout.pageX,
          screenY: layout.pageY + statusBarHeight,
          width: layout.width,
          height: layout.height
        })
        setPopupContentMode(mode)
        setFocusedOccurrenceId(occurrenceId)
        setPopupVisible(true)
      } else {
        console.warn('Could not get layout for popup from TappableTextSegment.')
      }
    },
    []
  )

  const handleWordSelect = useCallback(
    (occurrence: WordOccurrence, paragraph: ArticleParagraph, layout) => {
      setCurrentWordOccForPopup(occurrence)
      setCurrentGrammarOccForPopup(null)
      showPopupForOccurrence(layout, 'word', occurrence.occurrence_id)
    },
    [showPopupForOccurrence]
  )

  const handleGrammarSelect = useCallback(
    (occurrence: GrammarOccurrence, paragraph: ArticleParagraph, layout) => {
      setCurrentWordOccForPopup(null)
      setCurrentGrammarOccForPopup(occurrence)
      showPopupForOccurrence(layout, 'grammar', occurrence.occurrence_id)
    },
    [showPopupForOccurrence]
  )

  const handleClosePopup = useCallback(() => {
    setPopupVisible(false)
    setFocusedOccurrenceId(null)
  }, [])

  const saveWordAction = useCallback(
    (baseWord: BaseWordDetail) => {
      console.log(
        'Save Word action triggered for:',
        baseWord.word_fi,
        baseWord.base_word_id
      )
      showAuthDebugToast('info', 'Save Word', `Word: ${baseWord.word_fi}`)
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
    },
    [handleClosePopup]
  )
  const handleSaveGrammar = useRequireAuthAction(
    saveGrammarAction,
    'Login to save grammar notes.'
  )

  const handleBrandPress = () => {
    Alert.alert(`Brand: ${article?.brand?.display_name} (Not Implemented)`)
  }
  const handleShare = () => {
    Alert.alert('Share action not implemented')
  }
  const handlePlayArticleAudio = () => {
    Alert.alert('Full article audio playback not implemented yet.')
  }

  const isLoading =
    isLoadingArticleEntity ||
    (hasAttemptedFullFetch && !article?.paragraphs && !articleEntityError)
  const displayError = articleEntityError

  if (isLoading && !article && !displayError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (displayError && !article) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View
          style={[
            styles.customHeaderMinimal,
            { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
          ]}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerBackButtonMinimal}
          >
            <ArrowLeft size={22} color={Colors.common.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            Failed to load article: {displayError}
          </Text>
          <TouchableOpacity
            onPress={handleRefreshAction}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (
    article &&
    (!article.paragraphs || article.paragraphs.length === 0) &&
    isLoading
  ) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View
          style={[
            styles.customHeaderMinimal,
            { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
          ]}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerBackButtonMinimal}
          >
            <ArrowLeft size={22} color={Colors.common.white} />
          </TouchableOpacity>
          <View style={{ width: 30 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={{ marginTop: 10, color: Colors.light.textSecondary }}>
            Loading full article content...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View
          style={[
            styles.customHeaderMinimal,
            { paddingTop: Platform.OS === 'android' ? insets.top : 0 }
          ]}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.headerBackButtonMinimal}
          >
            <ArrowLeft size={22} color={Colors.common.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
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
          style={[styles.articleHeaderControlsContainer, { top: insets.top }]}
        >
          <ArticleHeaderControls
            onGoBack={handleGoBack}
            onToggleSave={handleToggleSave}
            onShare={handleShare}
            isSaveLoading={isSaveLoading}
            isArticleSaved={isOptimisticallySaved}
            isDesktop={isDesktop}
          />
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.wideScreenContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isPullRefreshing}
              onRefresh={handlePullRefresh}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', Colors.common.transparent]}
            style={styles.headerGradient}
          />

          <View
            style={[
              styles.articleContentContainer,
              isDesktop && styles.wideScreenArticleContainer
            ]}
          >
            <ArticleMetadataDisplay
              article={article}
              publicationDateFormatted={publicationDateFormatted}
              onBrandPress={handleBrandPress}
              isDesktop={isDesktop}
            />
            {(!article.paragraphs || article.paragraphs.length === 0) &&
              !isLoading && (
                <View style={styles.centered}>
                  <Text style={styles.errorText}>
                    Article content (paragraphs) could not be loaded.
                  </Text>
                </View>
              )}
            {article.id &&
              article.paragraphs &&
              article.paragraphs.length > 0 && (
                <>
                  <ArticleAudioPlayer
                    articleId={article.id}
                    onPlayPress={handlePlayArticleAudio}
                  />
                  <ArticleParagraphsList
                    paragraphs={article.paragraphs}
                    onWordSelect={handleWordSelect}
                    onGrammarSelect={handleGrammarSelect}
                    focusedOccurrenceId={focusedOccurrenceId}
                  />
                </>
              )}
            {article.brand?.display_name && (
              <View style={styles.sourceContainer}>
                <Text style={styles.sourceText}>
                  Source: {article.brand.display_name}
                </Text>
              </View>
            )}
          </View>

          {article.vocabulary && article.vocabulary.length > 0 && (
            <ArticleVocabularySection
              vocabulary={article.vocabulary}
              isDesktop={isDesktop}
            />
          )}
        </ScrollView>

        {popupVisible && popupPositionInternal && (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={handleClosePopup}
              accessibilityLabel="Close popup"
              accessibilityRole="button"
            />
            <InteractiveDetailPopup
              isVisible={popupVisible}
              contentMode={popupContentMode}
              wordOccurrenceData={currentWordOccForPopup}
              grammarOccurrenceData={currentGrammarOccForPopup}
              popupPosition={popupPositionInternal}
              onClose={handleClosePopup}
              onSaveWord={handleSaveWord}
              onSaveGrammar={handleSaveGrammar}
              onLearnMoreWord={baseWord =>
                Alert.alert('Learn More', baseWord.word_fi)
              }
              onLearnMoreGrammar={grammar =>
                Alert.alert('Learn More', grammar.name_en)
              }
              isDesktop={isDesktop}
            />
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
  customHeaderMinimal: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center'
  },
  headerBackButtonMinimal: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.common.black,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25
  },
  retryButtonText: {
    color: Colors.common.black,
    fontFamily: 'Inter-SemiBold',
    fontSize: 15
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 60
  },
  wideScreenContent: {},
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 1
  },
  articleHeaderControlsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10
  },
  articleContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: Colors.common.transparent,
    zIndex: 2
  },
  wideScreenArticleContainer: {
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center'
  },
  sourceContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
    marginTop: 24
  },
  sourceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: 'italic'
  }
})
