import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Pressable,
  Linking
} from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { Article } from '@features/articles/types'
import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions'

interface ArticleDetailViewProps {
  article: Article | null | undefined
  isLoading: boolean
  error: string | null
  onRetry: () => void
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  isLoading,
  error,
  onRetry
}) => {
  const router = useRouter()
  const segments = useSegments()
  const { isMobile } = useResponsiveDimensions()

  const handleRetry = () => {
    onRetry()
  }

  const handleGoBack = () => {
    const navigableSegments = segments.filter(
      segment => !/^\(.+\)$/.test(segment)
    )

    if (navigableSegments.length > 1) {
      const parentSegments = navigableSegments.slice(0, -1)
      const navigationPath = '/' + parentSegments.join('/')

      console.log('Navigating up to:', navigationPath)
      router.push(navigationPath)
    } else {
      console.log(
        'Cannot determine parent path from segments, navigating to "/" or back.'
      )
      router.back()
    }
  }

  const handleOpenUrl = async () => {
    if (!article?.url) return
    const supported = await Linking.canOpenURL(article.url)
    if (supported) {
      await Linking.openURL(article.url)
    } else {
      console.error(`Don't know how to open URL: ${article.url}`)
    }
  }

  if (isLoading && !article) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.infoText}>Loading Article...</Text>
      </View>
    )
  }

  if (error && !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error Loading Article:</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Article not found.</Text>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text
        style={[
          styles.title,
          isMobile ? styles.titleMobile : styles.titleDesktop
        ]}
      >
        {article.title || 'Untitled Article'}
      </Text>
      {article.date && (
        <Text style={styles.date}>
          {new Date(article.date).toLocaleString('fi-FI')}
        </Text>
      )}
      {article.url && (
        <Pressable onPress={handleOpenUrl}>
          <Text style={styles.sourceUrl}>Source: {article.url}</Text>
        </Pressable>
      )}
      <Text
        style={[
          styles.content,
          isMobile ? styles.contentMobile : styles.contentDesktop
        ]}
      >
        {article.content || 'Content not available.'}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 40 : 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 60
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.light.text,
    textAlign: 'center'
  },
  titleMobile: { fontSize: 22 },
  titleDesktop: { fontSize: 28 },
  date: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginBottom: 10,
    textAlign: 'center'
  },
  sourceUrl: {
    fontSize: 13,
    color: Colors.light.tint,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    textDecorationLine: 'underline'
  },
  content: {
    lineHeight: 24,
    color: Colors.light.text
  },
  contentMobile: { fontSize: 16 },
  contentDesktop: { fontSize: 17 },
  infoText: {
    marginTop: 10,
    color: Colors.light.text,
    fontSize: 16
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 'bold'
  },
  errorDetailText: {
    color: Colors.light.error,
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: Colors.light.tint,
    borderRadius: 5,
    marginBottom: 15
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  backButton: {
    marginTop: 15
  },
  backButtonText: {
    color: Colors.light.tint,
    fontSize: 15
  }
})
