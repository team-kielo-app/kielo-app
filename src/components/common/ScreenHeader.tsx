import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Colors } from '@constants/Colors'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScreenHeaderProps = {
  title: string
  canGoBack?: boolean
  fallbackPath?: string // Path to go if router.canGoBack() is false
}

/**
 * Reusable header component primarily for screens within a Stack navigator
 * that doesn't have a shared header, or needs a custom back behavior.
 */
export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  fallbackPath = '/(main)/(tabs)/' // Default fallback to main tabs
}) => {
  const router = useRouter()

  const handleGoBack = () => {
    if (router.canGoBack()) router.back()
    else router.replace(fallbackPath)
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.rightContainer} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: Platform.OS === 'ios' ? 44 : 56,
    backgroundColor: Colors.light.background
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  titleContainer: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightContainer: {
    flex: 1
  },
  backButton: {
    padding: 4,
    marginLeft: -4
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: Colors.light.text
  }
})
