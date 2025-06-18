import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { Colors } from '@constants/Colors'

const mascotIconUrl = 'https://cdn-icons-png.flaticon.com/512/2490/2490309.png'
const rocketIconUrl = 'https://cdn-icons-png.flaticon.com/512/1283/1283400.png'

interface LearningTipCardProps {
  tipTitle?: string
  tipDescription: string
  iconType?: 'mascot' | 'rocket'
  style?: ViewStyle
}

export function LearningTipCard({
  tipTitle = 'Learning Tip',
  tipDescription,
  iconType = 'mascot',
  style
}: LearningTipCardProps): React.ReactElement {
  const iconSource = iconType === 'mascot' ? mascotIconUrl : rocketIconUrl

  return (
    <View style={[styles.tipCard, style]}>
      <Image source={{ uri: iconSource }} style={styles.tipIcon} />
      <View style={styles.tipTextContainer}>
        <Text style={styles.tipTitle}>{tipTitle}</Text>
        <Text style={styles.tipDescription}>{tipDescription}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  tipCard: {
    backgroundColor: Colors.light.flashcardTipBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  tipIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
    resizeMode: 'contain'
  },
  tipTextContainer: {
    flex: 1
  },
  tipTitle: {
    fontFamily: 'Inter-Bold',
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 2
  },
  tipDescription: {
    fontFamily: 'Inter-Regular',
    color: Colors.light.text,
    opacity: 0.7,
    fontSize: 12,
    lineHeight: 16
  }
})
