// src/components/ArticleDetailView.tsx
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
// Import useSegments along with useRouter
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
  // Get the current path segments
  const segments = useSegments()
  const { isMobile } = useResponsiveDimensions()

  // --- Action Handlers ---
  const handleRetry = () => {
    onRetry()
  }

  const handleGoBack = () => {
    // Filter out layout segments (e.g., "(app)") and group segments
    const navigableSegments = segments.filter(
      // Regex matches segments starting with '(' and ending with ')'
      segment => !/^\(.+\)$/.test(segment)
      // Add more filters if needed, e.g., filter out 'index' if it's not desired
      // segment => !/^\(.+\)$/.test(segment) && segment !== 'index'
    )

    // Check if there are navigable segments to go back from
    if (navigableSegments.length > 1) {
      // Create the parent path by removing the last navigable segment
      const parentSegments = navigableSegments.slice(0, -1)
      const navigationPath = '/' + parentSegments.join('/') // Ensure leading slash

      console.log('Navigating up to:', navigationPath)
      router.push(navigationPath)
    } else {
      // Fallback: Navigate to root or just go back in history if parent cannot be determined
      console.log(
        'Cannot determine parent path from segments, navigating to "/" or back.'
      )
      // Option 1: Go to a known root for the section
      // router.push('/');
      // Option 2: Fallback to simple history back
      router.back()
    }
  }

  const handleOpenUrl = async () => {
    // ... (keep existing handleOpenUrl implementation)
    if (!article?.url) return
    const supported = await Linking.canOpenURL(article.url)
    if (supported) {
      await Linking.openURL(article.url)
    } else {
      console.error(`Don't know how to open URL: ${article.url}`)
    }
  }

  // --- Render Logic ---

  // 1. Loading State
  if (isLoading && !article) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.infoText}>Loading Article...</Text>
      </View>
    )
  }

  // 2. Error State
  if (error && !article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error Loading Article:</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <Pressable onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
        {/* Use the updated handleGoBack */}
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // 3. Not Found State
  if (!article) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Article not found.</Text>
        {/* Use the updated handleGoBack */}
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // 4. Display Article Content
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* ... keep existing content rendering (title, date, url, content) ... */}
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
    maxWidth: 800, // Max width for readability on web/tablet
    width: '100%',
    alignSelf: 'center', // Center content column
    paddingBottom: 60 // Ensure space at the bottom
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
    color: Colors.light.tint, // Make it look like a link
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    textDecorationLine: 'underline' // Underline to indicate pressable
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
