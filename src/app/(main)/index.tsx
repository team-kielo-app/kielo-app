import { Redirect } from 'expo-router'

// This screen acts as the entry point for the (main) group.
// It immediately redirects to the primary content area, typically the tabs.
export default function MainIndex() {
  return <Redirect href="/(main)/(tabs)/" />
}
