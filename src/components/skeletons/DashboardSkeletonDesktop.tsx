import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SkeletonBlock } from './SkeletonElements'
import { DashboardContentSkeleton } from './DashboardContentSkeleton'
import { Colors } from '@constants/Colors'

const SIDEBAR_WIDTH = 240

export const DashboardSkeletonDesktop: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <SkeletonBlock
          width="60%"
          height={30}
          borderRadius={6}
          style={styles.sidebarItem}
        />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
        <View style={{ flex: 1 }} />
        <SkeletonBlock
          width="80%"
          height={24}
          borderRadius={4}
          style={styles.sidebarItem}
        />
      </View>

      <View style={styles.mainContent}>
        <DashboardContentSkeleton />
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.light.background
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: Colors.common.white,
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: Colors.light.border
  },
  mainContent: {
    flex: 1,
    height: '100%'
  },
  sidebarItem: {
    marginBottom: 25
  }
})
