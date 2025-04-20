import { View, ActivityIndicator } from 'react-native'
import { Colors } from '@constants/Colors'

// This screen is displayed briefly while the root layout determines
// the correct initial route based on authentication status.
// It relies on the RootLayout's useEffect to redirect.
export default function AppEntry() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background
      }}
    >
      <ActivityIndicator size="large" color={Colors.light.primary} />
    </View>
  )
}
