import { View, ActivityIndicator } from 'react-native'
import { Colors } from '@constants/Colors'

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
