import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TAB_BAR_DESIGN_HEIGHT = 70
const TAB_BAR_BOTTOM_MARGIN = 15

export function useFloatingTabBarHeight(): number {
  const insets = useSafeAreaInsets()
  return TAB_BAR_DESIGN_HEIGHT + Math.max(insets.bottom, TAB_BAR_BOTTOM_MARGIN)
}
