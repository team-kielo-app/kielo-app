import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
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
import { useRefresh } from '@hooks/useRefresh'
import { RefreshControl } from 'react-native'
import type { ArticleParagraph } from '@/features/articles/types'

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

  const [isSavedLocally, setIsSavedLocally] = useState(false)
  const [selectedParagraph, setSelectedParagraph] = useState<null | object>(
    null
  )

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

  const handleTextSelection = (paragraph: object) => {
    if (!paragraph.translation_en) return
    setSelectedParagraph(paragraph)
  }
  const closeTranslationModal = () => {
    setSelectedParagraph(null)
  }

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
            onShare={handleShare} // Pass the new handler
            isSaveLoading={isSaveLoading || !itemId} // Combined disabled state
            isArticleSaved={isOptimisticallySaved}
            isDesktop={isDesktop}
          />
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
            <ArticleMetadataDisplay
              article={article}
              publicationDateFormatted={publicationDateFormatted}
              onBrandPress={handleBrandPress}
              isDesktop={isDesktop}
            />

            {/* Conditionally render if audio is available for the article */}
            {article?.id && ( // Assuming audio availability is tied to article ID or a specific field
              <ArticleAudioPlayer
                articleId={article.id}
                onPlayPress={handlePlayArticleAudio}
              />
            )}

            <ArticleParagraphsList
              paragraphs={article?.paragraphs}
              onParagraphSelect={handleTextSelection} // Pass the selection handler
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

        {/* Translation Modal */}
        <TranslationModal
          isVisible={selectedParagraph !== null}
          selectedParagraph={selectedParagraph as ArticleParagraph | null} // Cast because state can be generic object initially
          onClose={closeTranslationModal}
          onSaveVocabulary={(original, translated) => {
            // Adapt handleSaveVocabulary if you need original and translated text
            // For now, it expects a single 'word' string.
            // We might need to adjust how 'saveVocabularyAction' works or what it expects.
            handleSaveVocabulary(original) // Passing original text for now
          }}
          isDesktop={isDesktop}
        />
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
