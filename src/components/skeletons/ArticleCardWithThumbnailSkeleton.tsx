import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SkeletonBlock } from './SkeletonElements'
import { Colors } from '@constants/Colors'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

interface ArticleCardWithThumbnailSkeletonProps {
  size?: 'small' | 'medium' | 'large'
}

export function ArticleCardWithThumbnailSkeleton({
  size = 'small'
}: ArticleCardWithThumbnailSkeletonProps): React.ReactElement {
  const { isDesktop } = useResponsiveDimensions()

  const cardDimensions = React.useMemo(() => {
    let width = 220
    let imageHeight = 140
    if (size === 'medium') {
      width = isDesktop ? 280 : 240
      imageHeight = isDesktop ? 180 : 150
    } else if (size === 'large') {
      width = isDesktop ? 340 : 260
      imageHeight = isDesktop ? 220 : 170
    }
    return { width, imageHeight }
  }, [size, isDesktop])

  return (
    <View style={[styles.container, { width: cardDimensions.width }]}>
      <SkeletonBlock
        width="100%"
        height={cardDimensions.imageHeight}
        borderRadius={0}
        style={styles.imagePlaceholder}
      />
      <View style={styles.contentContainer}>
        <SkeletonBlock
          width="80%"
          height={18}
          borderRadius={4}
          style={{ marginBottom: 8 }}
        />
        <SkeletonBlock
          width="60%"
          height={18}
          borderRadius={4}
          style={{ marginBottom: 10 }}
        />
        <View style={styles.metaLine}>
          <SkeletonBlock width="40%" height={12} borderRadius={4} />
          <SkeletonBlock
            width="30%"
            height={12}
            borderRadius={4}
            style={{ marginLeft: 'auto' }}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle
  },
  imagePlaceholder: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  contentContainer: {
    padding: 12
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  }
})
