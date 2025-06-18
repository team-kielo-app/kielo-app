import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native'
import { ArrowLeft, Bookmark, Share, BookmarkCheck } from 'lucide-react-native'
import { Colors } from '@constants/Colors'

interface ArticleHeaderControlsProps {
  onGoBack: () => void
  onToggleSave: () => void
  onShare: () => void // Assuming a share function will be implemented
  isSaveLoading: boolean
  isArticleSaved: boolean // Reflects the current saved state (optimistic or from store)
  isDesktop?: boolean // Optional prop for styling differences
}

export const ArticleHeaderControls: React.FC<ArticleHeaderControlsProps> = ({
  onGoBack,
  onToggleSave,
  onShare,
  isSaveLoading,
  isArticleSaved,
  isDesktop = false
}) => {
  return (
    <View
      style={[
        styles.articleHeaderControls,
        isDesktop
          ? styles.wideScreenHeaderControls
          : styles.mobileHeaderControls
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={onGoBack}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        pointerEvents="auto"
      >
        <ArrowLeft size={22} color={Colors.common.white} />
      </TouchableOpacity>
      <View style={styles.headerRightButtons}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onToggleSave}
          disabled={isSaveLoading}
          accessibilityLabel={
            isArticleSaved ? 'Unsave article' : 'Save article'
          }
          accessibilityRole="button"
          pointerEvents="auto"
        >
          {isSaveLoading ? (
            <ActivityIndicator size="small" color={Colors.common.white} />
          ) : isArticleSaved ? (
            <BookmarkCheck size={22} color={Colors.light.primary} />
          ) : (
            <Bookmark size={22} color={Colors.common.white} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onShare}
          accessibilityLabel="Share article"
          accessibilityRole="button"
          pointerEvents="auto"
        >
          <Share size={22} color={Colors.common.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

// Styles are copied and adapted from ArticleScreen.tsx
// Consider moving to a shared style sheet if these styles are reused elsewhere.
const styles = StyleSheet.create({
  articleHeaderControls: {
    position: 'absolute', // Will be placed absolutely by the parent (ArticleScreen)
    top: 0, // Or adjust based on SafeAreaInsets in the parent
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10, // Standard padding
    zIndex: 3, // Ensure it's above other content like header gradients
    marginTop: 10 // This margin will be handled by SafeAreaView in ArticleScreen
  },
  mobileHeaderControls: {},
  wideScreenHeaderControls: {
    marginHorizontal: 20 // Keep specific wide-screen horizontal margin
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
