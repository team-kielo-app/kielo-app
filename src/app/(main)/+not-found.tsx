import { Link, Stack } from 'expo-router'
import { StyleSheet, View, Text } from 'react-native'
import { Colors } from '@constants/Colors'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Screen Not Found</Text>
        <Text style={styles.message}>
          This screen doesn't exist within the main app section.
        </Text>
        <Link href="/(main)/(tabs)/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home Screen</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.light.background // Use your background color
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text, // Use your text color
    marginBottom: 15
  },
  message: {
    fontSize: 16,
    color: Colors.light.textSecondary, // Use your secondary text color
    textAlign: 'center',
    marginBottom: 20
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  },
  linkText: {
    fontSize: 14,
    color: Colors.light.primary // Use your primary/link color
  }
})
