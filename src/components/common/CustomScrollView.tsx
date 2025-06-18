// src/components/common/CustomScrollView.tsx
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle,
  ScrollViewProps
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native'
import { Colors } from '@constants/Colors'

const SCROLL_ARROW_SIZE = 30
const SCROLL_ARROW_ICON_SIZE = 20
const SHADOW_SIZE = 15

interface CustomScrollViewProps
  extends Omit<
    ScrollViewProps,
    | 'onScroll'
    | 'onLayout'
    | 'scrollEventThrottle'
    | 'ref'
    | 'style'
    | 'contentContainerStyle'
    | 'children'
  > {
  children: ReactNode
  scrollRef?: React.RefObject<ScrollView>
  style?: ViewStyle // Style for the ScrollView itself
  containerStyle?: ViewStyle // Style for the outer wrapper
  innerContentStyle?: ViewStyle // Style for the direct child View that wraps children (for onLayout)
  contentContainerStyle?: ViewStyle // Passed to ScrollView's contentContainerStyle
  horizontal?: boolean
  showScrollArrows?: boolean
  showScrollShadows?: boolean
}

export const CustomScrollView: React.FC<CustomScrollViewProps> = ({
  children,
  scrollRef: externalScrollRef,
  style,
  containerStyle,
  innerContentStyle,
  contentContainerStyle,
  horizontal = false,
  showScrollArrows = true,
  showScrollShadows = true,
  ...scrollViewNativeProps
}) => {
  const internalScrollRef = useRef<ScrollView>(null)
  const scrollRef = externalScrollRef || internalScrollRef

  const measuredContentLayout = useRef({ width: 0, height: 0 })
  const scrollViewLayout = useRef({ width: 0, height: 0 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isScrollable, setIsScrollable] = useState({ x: false, y: false })

  const topShadowOpacity = useRef(new Animated.Value(0)).current
  const bottomShadowOpacity = useRef(new Animated.Value(0)).current
  const leftShadowOpacity = useRef(new Animated.Value(0)).current
  const rightShadowOpacity = useRef(new Animated.Value(0)).current

  const updateScrollState = useCallback(() => {
    const contentSize = measuredContentLayout.current
    const viewSize = scrollViewLayout.current

    if (!viewSize.width && !viewSize.height) return

    const canScrollX = contentSize.width > viewSize.width + 1
    const canScrollY = contentSize.height > viewSize.height + 1

    if (isScrollable.x !== canScrollX || isScrollable.y !== canScrollY) {
      setIsScrollable({ x: canScrollX, y: canScrollY })
    }

    const currentX = scrollPosition.x
    const currentY = scrollPosition.y

    Animated.parallel([
      Animated.timing(topShadowOpacity, {
        toValue: canScrollY && currentY > 5 ? 1 : 0,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(bottomShadowOpacity, {
        toValue:
          canScrollY &&
          viewSize.height > 0 &&
          currentY < contentSize.height - viewSize.height - 5
            ? 1
            : 0,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(leftShadowOpacity, {
        toValue: canScrollX && currentX > 5 ? 1 : 0,
        duration: 50,
        useNativeDriver: true
      }),
      Animated.timing(rightShadowOpacity, {
        toValue:
          canScrollX &&
          viewSize.width > 0 &&
          currentX < contentSize.width - viewSize.width - 5
            ? 1
            : 0,
        duration: 50,
        useNativeDriver: true
      })
    ]).start()
  }, [
    isScrollable,
    scrollPosition,
    topShadowOpacity,
    bottomShadowOpacity,
    leftShadowOpacity,
    rightShadowOpacity
  ])

  useEffect(() => {
    updateScrollState()
  }, [
    updateScrollState,
    measuredContentLayout.current,
    scrollViewLayout.current
  ])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent
    setScrollPosition({ x: contentOffset.x, y: contentOffset.y })
    // updateScrollState will be triggered by useEffect due to scrollPosition change
    if (scrollViewNativeProps.onScroll) {
      // Forward native onScroll
      scrollViewNativeProps.onScroll(event)
    }
  }

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const newLayout = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height
    }
    if (
      newLayout.width !== measuredContentLayout.current.width ||
      newLayout.height !== measuredContentLayout.current.height
    ) {
      measuredContentLayout.current = newLayout
      updateScrollState() // Update immediately as content size is now known
    }
  }

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const newLayout = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height
    }
    if (
      newLayout.width !== scrollViewLayout.current.width ||
      newLayout.height !== scrollViewLayout.current.height
    ) {
      scrollViewLayout.current = newLayout
      updateScrollState() // Update immediately as view size is now known
    }
  }

  const scrollByOffset = (dx: number, dy: number) => {
    if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
      scrollRef.current.scrollTo({
        x: scrollPosition.x + dx,
        y: scrollPosition.y + dy,
        animated: true
      })
    } else {
      console.warn(
        'CustomScrollView: scrollRef.current is not available or scrollTo is not a function.'
      )
    }
  }

  return (
    <View style={[styles.outerWrapper, containerStyle]}>
      {/* Shadows */}
      {showScrollShadows && !horizontal && (
        <>
          <Animated.View
            style={[
              styles.shadow,
              styles.shadowTop,
              { opacity: topShadowOpacity }
            ]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.10)', 'transparent']}
              style={styles.gradientFill}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.shadow,
              styles.shadowBottom,
              { opacity: bottomShadowOpacity }
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.10)']}
              style={styles.gradientFill}
            />
          </Animated.View>
        </>
      )}
      {showScrollShadows && horizontal && (
        <>
          <Animated.View
            style={[
              styles.shadow,
              styles.shadowLeft,
              { opacity: leftShadowOpacity }
            ]}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.10)', 'transparent']}
              style={styles.gradientFillHorizontal}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.shadow,
              styles.shadowRight,
              { opacity: rightShadowOpacity }
            ]}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.10)']}
              style={styles.gradientFillHorizontal}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0 }}
            />
          </Animated.View>
        </>
      )}

      <ScrollView
        ref={scrollRef}
        style={[styles.scrollContent, style]}
        contentContainerStyle={contentContainerStyle}
        horizontal={horizontal}
        onScroll={handleScroll}
        onLayout={handleScrollViewLayout}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        {...scrollViewNativeProps}
      >
        <View onLayout={handleContentLayout} style={innerContentStyle}>
          {children}
        </View>
      </ScrollView>

      {/* Arrows */}
      {showScrollArrows && !horizontal && isScrollable.y && (
        <>
          <Animated.View
            style={{
              opacity: topShadowOpacity,
              position: 'absolute',
              top: 5,
              alignSelf: 'center',
              zIndex: 3
            }}
          >
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() =>
                scrollByOffset(0, -scrollViewLayout.current.height * 0.8)
              }
            >
              <ChevronUp
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.common.white}
              />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              opacity: bottomShadowOpacity,
              position: 'absolute',
              bottom: 5,
              alignSelf: 'center',
              zIndex: 3
            }}
          >
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() =>
                scrollByOffset(0, scrollViewLayout.current.height * 0.8)
              }
            >
              <ChevronDown
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.common.white}
              />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
      {showScrollArrows && horizontal && isScrollable.x && (
        <>
          <Animated.View
            style={{
              opacity: leftShadowOpacity,
              position: 'absolute',
              left: 5,
              alignSelf: 'center',
              zIndex: 3,
              top: '50%',
              transform: [{ translateY: -SCROLL_ARROW_SIZE / 2 }]
            }}
          >
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() =>
                scrollByOffset(-scrollViewLayout.current.width * 0.8, 0)
              }
            >
              <ChevronLeft
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.common.white}
              />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={{
              opacity: rightShadowOpacity,
              position: 'absolute',
              right: 5,
              alignSelf: 'center',
              zIndex: 3,
              top: '50%',
              transform: [{ translateY: -SCROLL_ARROW_SIZE / 2 }]
            }}
          >
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() =>
                scrollByOffset(scrollViewLayout.current.width * 0.8, 0)
              }
            >
              <ChevronRight
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.common.white}
              />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  outerWrapper: { flex: 1, overflow: 'hidden', position: 'relative' },
  scrollContent: { flex: 1, zIndex: 1 },
  shadow: { position: 'absolute', pointerEvents: 'none', zIndex: 2 },
  shadowTop: { top: 0, left: 0, right: 0, height: SHADOW_SIZE },
  shadowBottom: { bottom: 0, left: 0, right: 0, height: SHADOW_SIZE },
  shadowLeft: { top: 0, bottom: 0, left: 0, width: SHADOW_SIZE },
  shadowRight: { top: 0, bottom: 0, right: 0, width: SHADOW_SIZE },
  gradientFill: { flex: 1 },
  gradientFillHorizontal: { flex: 1, width: '100%', height: '100%' },
  arrowButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: SCROLL_ARROW_SIZE,
    height: SCROLL_ARROW_SIZE,
    borderRadius: SCROLL_ARROW_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  }
})
