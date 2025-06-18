// src/components/ArticleListItem.tsx
import React from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { Link } from 'expo-router'
import { Article } from '@features/articles/types' // Assuming type definition exists
import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@hooks/useResponsiveDimensions' // Can use hooks here

interface ArticleListItemProps {
  article: Article
}

export const ArticleListItem: React.FC<ArticleListItemProps> = React.memo(
  ({ article }) => {
    const { isMobile } = useResponsiveDimensions() // Use hook for styling

    // Basic validation or fallback
    if (!article) {
      return null // Or render a placeholder/error state for this item
    }

    return (
      <Link
        href={{ pathname: '/(app)/reader/[id]', params: { id: article.id } }}
        asChild
      >
        <Pressable style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text
              style={[
                styles.itemTitle,
                isMobile ? styles.itemTitleMobile : styles.itemTitleDesktop
              ]}
            >
              {article.title || 'Untitled Article'}
            </Text>
            {article.date && ( // Conditionally render date
              <Text style={styles.itemDate}>
                {new Date(article.date).toLocaleDateString('fi-FI')}
              </Text>
            )}
            {/* Add other elements like author, snippet etc. if needed */}
          </View>
        </Pressable>
      </Link>
    )
  }
)

// Consistent styling (can be moved to a shared file later)
const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: Colors.light.background, // Use theme color
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border, // Use theme color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.0,
    elevation: 1
  },
  itemContent: {
    padding: 15
  },
  itemTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.light.text
  },
  itemTitleMobile: { fontSize: 16 },
  itemTitleDesktop: { fontSize: 18 },
  itemDate: {
    fontSize: 12,
    color: Colors.light.textMuted, // Use a muted color
    marginBottom: 5
  }
})
