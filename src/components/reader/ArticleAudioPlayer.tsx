import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { PlayCircle } from 'lucide-react-native'
import { Colors } from '@constants/Colors'

interface ArticleAudioPlayerProps {
  articleId: string
  onPlayPress: () => void
}

const MOCK_AUDIO_DURATION = '4:32'

export function ArticleAudioPlayer({
  articleId,
  onPlayPress
}: ArticleAudioPlayerProps): React.ReactElement {
  const displayDuration = MOCK_AUDIO_DURATION

  return (
    <TouchableOpacity
      style={styles.audioPlayerOuterContainer}
      onPress={onPlayPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Listen to article, duration ${displayDuration}`}
    >
      <View style={styles.audioPlayerContent}>
        <PlayCircle size={24} color={Colors.light.primary} />
        <Text style={styles.audioPlayerText}>Listen to Article</Text>
      </View>
      {displayDuration && (
        <View style={styles.audioDurationBadge}>
          <Text style={styles.audioDurationText}>{displayDuration}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  audioPlayerOuterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.common.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadowSoft,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.light.borderSubtle
  },
  audioPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  audioPlayerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    color: Colors.light.text,
    marginLeft: 10
  },
  audioDurationBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  audioDurationText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: Colors.light.textSecondary
  }
})
