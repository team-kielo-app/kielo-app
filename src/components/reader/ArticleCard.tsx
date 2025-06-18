import React, { useMemo } from 'react'
import type { Article as ArticleType } from '@features/articles/types'
import { Colors } from '@constants/Colors'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native'
import { BookOpen } from 'lucide-react-native'
import { formatDistanceToNowStrict } from 'date-fns'

interface ArticleCardProps {
  article: ArticleType
  onPress: () => void
}

export function ArticleCard({
  article,
  onPress
}: ArticleCardProps): React.ReactElement {
  const formattedDate = useMemo(() => {
    if (!article?.publication_date) return ''
    return formatDistanceToNowStrict(new Date(article.publication_date), {
      addSuffix: true
    })
  }, [article?.publication_date])

  const handleBrandPress = (e: any) => {
    e.stopPropagation()
    console.log('Brand pressed (ArticleCard):', article?.brand?.display_name)
    Alert.alert(
      'Brand Action',
      `Brand: ${article?.brand?.display_name} (Not Implemented)`
    )
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.bookmarkIconContainer}>
        <BookOpen size={18} color={Colors.light.textTertiary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={3}>
          {article?.title || 'Untitled Article'}
        </Text>

        <View style={styles.footer}>
          {article?.brand?.display_name && (
            <Pressable onPress={handleBrandPress} hitSlop={10}>
              <Text style={styles.brandName}>{article.brand.display_name}</Text>
            </Pressable>
          )}
          {article?.publication_date && (
            <Text style={styles.dateText}>{formattedDate}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}
import { Alert } from 'react-native'

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle,
    overflow: 'hidden',
    padding: 16,
    position: 'relative'
  },
  bookmarkIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1
  },
  content: {
    flex: 1,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
    color: Colors.light.text,
    marginBottom: 10,
    lineHeight: 23,
    paddingRight: 30
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  brandName: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.light.primary,
    paddingVertical: 2,
    marginRight: 8,
    flexShrink: 1
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.light.textSecondary,
    textAlign: 'right',
    flexShrink: 0
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2
  }
})
