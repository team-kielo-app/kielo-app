import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { ChevronRight, Trophy } from 'lucide-react-native'
import { Colors } from '@constants/Colors'

interface DailyChallengeProps {
  onStartChallenge: (challengeId: string) => void
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  onStartChallenge
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Challenge</Text>
      </View>
      <TouchableOpacity
        style={styles.challengeCard}
        onPress={() => onStartChallenge('news_article_challenge')}
        accessibilityRole="button"
        accessibilityLabel="Start daily challenge: Complete a News Article"
      >
        <View style={styles.challengeContent}>
          <View style={styles.challengeIconContainer}>
            <Trophy size={24} color={Colors.light.white} />
          </View>
          <View style={styles.challengeTextContainer}>
            <Text style={styles.challengeTitle}>Complete a News Article</Text>
            <Text style={styles.challengeSubtitle}>
              Read and learn 5 new words
            </Text>
          </View>
        </View>
        <View style={styles.challengeContentRight}>
          <ChevronRight size={20} color={Colors.light.textSecondary} />
        </View>
      </TouchableOpacity>
    </View>
  )
}

// Styles copied and adapted from HomeScreen
const styles = StyleSheet.create({
  section: {
    marginBottom: 28 // Or adjust as this might be the last item
  },
  sectionHeader: {
    // No need for space-between if only title is present
    marginBottom: 8
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  },
  challengeCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    width: '100%'
  },
  challengeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allow content to shrink if needed
    marginRight: 8, // Space before chevron
    flex: 1 // Take available space
  },
  challengeContentRight: {
    // For the chevron, no specific style needed beyond what's in parent
  },
  challengeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.accent, // Or another distinct color for challenge
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  challengeTextContainer: {
    flex: 1 // Allow text to take available space
  },
  challengeTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4
  },
  challengeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: Colors.light.textSecondary
  }
})
