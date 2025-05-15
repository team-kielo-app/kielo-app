import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { PlayCircle } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
// If you plan to implement actual audio playback here, you might need:
// import { useAudioPlayer, AudioPlayerStatus } from 'expo-audio';
// import { Audio } from 'expo-av';

interface ArticleAudioPlayerProps {
  articleId: string // Or a direct audio URL if available on the article object
  // mockAudioDuration?: string; // For display, replace with actual duration logic
  onPlayPress: () => void // Callback when play is pressed
  // Potentially add props for actual playback control if implemented here:
  // isPlaying?: boolean;
  // isLoading?: boolean;
  // duration?: number;
  // position?: number;
}

export const ArticleAudioPlayer: React.FC<ArticleAudioPlayerProps> = ({
  articleId,
  onPlayPress
  // mockAudioDuration = "4:32", // Keeping placeholder for now
}) => {
  // Placeholder for actual audio duration.
  // This would typically come from the article's audio metadata or be fetched.
  const displayDuration = '4:32' // Replace with actual logic if available

  return (
    <TouchableOpacity
      style={styles.audioPlayerContainer}
      onPress={onPlayPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Listen to article, duration ${displayDuration}`}
    >
      <View style={styles.audioPlayerContent}>
        <PlayCircle size={24} color={Colors.light.primary} />
        <Text style={styles.audioPlayerText}>Listen to Article</Text>
      </View>
      {displayDuration && (
        <View style={styles.audioDuration}>
          <Text style={styles.audioDurationText}>{displayDuration}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// Styles are copied and adapted from ArticleScreen.tsx
const styles = StyleSheet.create({
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 12,
    marginBottom: 24, // Spacing before paragraphs
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  audioPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  audioPlayerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8
  },
  audioDuration: {
    backgroundColor: Colors.light.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  audioDurationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: Colors.light.textSecondary
  }
})
