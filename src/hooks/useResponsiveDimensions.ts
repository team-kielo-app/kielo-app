import { useWindowDimensions } from 'react-native'

const MOBILE_BREAKPOINT = 768 // Example breakpoint for mobile/desktop distinction

export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions()
  const isMobile = width < MOBILE_BREAKPOINT
  const isDesktop = !isMobile

  return {
    width,
    height,
    isMobile,
    isDesktop
    // Add more specific breakpoints if needed (e.g., isTablet)
  }
}
