import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { SkeletonBlock, SkeletonCircle } from './SkeletonElements'
import { Colors } from '@/constants/Colors'

export const DashboardContentSkeleton: React.FC = React.memo(() => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <SkeletonBlock
            width="70%"
            height={28}
            borderRadius={6}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBlock width="50%" height={18} borderRadius={4} />
        </View>
        <SkeletonCircle size={44} />
      </View>

      <View style={styles.card}>
        <SkeletonBlock
          width="40%"
          height={20}
          borderRadius={4}
          style={{ marginBottom: 20 }}
        />
        <View style={styles.streakBars}>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={styles.barContainer}>
              <SkeletonBlock
                width={16}
                height={Math.random() * 80 + 40}
                borderRadius={4}
              />
              <SkeletonBlock
                width={20}
                height={12}
                borderRadius={4}
                style={{ marginTop: 8 }}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <SkeletonBlock width={150} height={22} borderRadius={4} />
        <SkeletonBlock width={60} height={18} borderRadius={4} />
      </View>
      <View style={styles.progressRow}>
        <View style={[styles.card, styles.progressCard]}>
          <SkeletonBlock
            width="50%"
            height={18}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          <SkeletonBlock
            width="70%"
            height={14}
            borderRadius={4}
            style={{ marginBottom: 20 }}
          />
          <SkeletonBlock width="100%" height={8} borderRadius={4} />
        </View>
        <View style={[styles.card, styles.progressCard]}>
          <SkeletonBlock
            width="50%"
            height={18}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          <SkeletonBlock
            width="70%"
            height={14}
            borderRadius={4}
            style={{ marginBottom: 20 }}
          />
          <SkeletonBlock width="100%" height={8} borderRadius={4} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <SkeletonBlock width={180} height={22} borderRadius={4} />
        <SkeletonBlock width={60} height={18} borderRadius={4} />
      </View>
      <View style={styles.articlesRow}>
        {[...Array(3)].map((_, i) => (
          <View key={i} style={[styles.card, styles.articleCard]}>
            <SkeletonBlock
              width="90%"
              height={18}
              borderRadius={4}
              style={{ marginBottom: 6 }}
            />
            <SkeletonBlock
              width="60%"
              height={18}
              borderRadius={4}
              style={{ marginBottom: 12 }}
            />
            <SkeletonBlock width="70%" height={14} borderRadius={4} />
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <SkeletonBlock width={150} height={22} borderRadius={4} />
      </View>
      <View style={[styles.card, styles.challengeCard]}>
        <SkeletonCircle size={36} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <SkeletonBlock
            width="80%"
            height={16}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBlock width="60%" height={14} borderRadius={4} />
        </View>
        <SkeletonBlock width={10} height={16} borderRadius={4} />
      </View>
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30
  },
  headerText: {
    flex: 1,
    marginRight: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.border
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10
  },
  streakBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120
  },
  barContainer: {
    alignItems: 'center'
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -5
  },
  progressCard: {
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'flex-start'
  },
  articlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -5
  },
  articleCard: {
    flex: 1,
    marginHorizontal: 5,
    minHeight: 120,
    alignItems: 'flex-start'
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})
