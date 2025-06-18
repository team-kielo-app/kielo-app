import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SkeletonBlock } from './SkeletonElements'
import { DashboardContentSkeleton } from './DashboardContentSkeleton'
import { Colors } from '@constants/Colors'

const TAB_BAR_HEIGHT = 60

export const DashboardSkeletonMobile: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <DashboardContentSkeleton />
      </View>

      <View style={styles.tabBar}>
        {[...Array(4)].map((_, i) => (
          <View key={i} style={styles.tabItem}>
            <SkeletonBlock
              width={24}
              height={24}
              borderRadius={4}
              style={{ marginBottom: 4 }}
            />
            <SkeletonBlock width={40} height={10} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background
  },
  mainContent: {
    flex: 1
  },
  tabBar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.common.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.border,
    paddingHorizontal: 10,
    paddingBottom: 5,
    paddingTop: 5
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center'
  }
})
