// src/components/common/CustomFlatList.tsx
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from 'react'
import {
  View,
  FlatList, // Changed from ScrollView
  StyleSheet,
  TouchableOpacity,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle,
  FlatListProps // Changed from ScrollViewProps
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

interface CustomFlatListProps<ItemT>
  extends Omit<
    FlatListProps<ItemT>,
    | 'onScroll'
    | 'onLayout'
    | 'scrollEventThrottle'
    | 'ref'
    | 'style'
    | 'contentContainerStyle'
    | 'onContentSizeChange'
  > {
  scrollRef?: React.RefObject<FlatList<ItemT>>
  style?: ViewStyle
  containerStyle?: ViewStyle
  contentContainerStyle?: ViewStyle
  showScrollArrows?: boolean
  showScrollShadows?: boolean
  // horizontal is already a FlatList prop
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void // Allow forwarding native onScroll
}

export function CustomFlatList<ItemT>({
  scrollRef: externalScrollRef,
  style,
  containerStyle,
  contentContainerStyle,
  horizontal = false, // Default from FlatListProps might be different, ensure consistency
  showScrollArrows = true,
  showScrollShadows = true,
  onScroll: nativeOnScrollFromProps, // Renamed to avoid conflict
  ...flatListNativeProps
}: CustomFlatListProps<ItemT>) {
  const internalScrollRef = useRef<FlatList<ItemT>>(null)
  const scrollRef = externalScrollRef || internalScrollRef

  const flatListLayout = useRef({ width: 0, height: 0 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [isScrollable, setIsScrollable] = useState({ x: false, y: false })
  const [currentContentSize, setCurrentContentSize] = useState({
    width: 0,
    height: 0
  })

  const topShadowOpacity = useRef(new Animated.Value(0)).current
  const bottomShadowOpacity = useRef(new Animated.Value(0)).current
  const leftShadowOpacity = useRef(new Animated.Value(0)).current
  const rightShadowOpacity = useRef(new Animated.Value(0)).current

  const updateScrollState = useCallback(() => {
    const contentSize = currentContentSize
    const viewSize = flatListLayout.current

    if (
      (!viewSize.width && !viewSize.height) ||
      (!contentSize.width &&
        !contentSize.height &&
        flatListNativeProps.data?.length === 0)
    ) {
      // If FlatList has no data, contentSize can be 0, treat as not scrollable.
      if (isScrollable.x || isScrollable.y)
        setIsScrollable({ x: false, y: false })
      Animated.parallel([
        Animated.timing(topShadowOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(bottomShadowOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(leftShadowOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(rightShadowOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        })
      ]).start()
      return
    }

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
    currentContentSize,
    topShadowOpacity,
    bottomShadowOpacity,
    leftShadowOpacity,
    rightShadowOpacity
  ]) // Added flatListNativeProps.data

  useEffect(() => {
    updateScrollState()
  }, [
    updateScrollState,
    flatListLayout.current.width,
    flatListLayout.current.height,
    currentContentSize.width,
    currentContentSize.height
  ])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    setScrollPosition({ x: contentOffset.x, y: contentOffset.y })

    // contentSize from onScroll is reliable, update if different
    if (
      contentSize.width !== currentContentSize.width ||
      contentSize.height !== currentContentSize.height
    ) {
      setCurrentContentSize({
        width: contentSize.width,
        height: contentSize.height
      })
    }
    // Also update layoutMeasurement if it changed (e.g. screen rotation)
    if (
      layoutMeasurement.width !== flatListLayout.current.width ||
      layoutMeasurement.height !== flatListLayout.current.height
    ) {
      flatListLayout.current = {
        width: layoutMeasurement.width,
        height: layoutMeasurement.height
      }
    }

    if (nativeOnScrollFromProps) {
      nativeOnScrollFromProps(event)
    }
  }

  const handleFlatListLayout = (event: LayoutChangeEvent) => {
    const newLayout = {
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height
    }
    if (
      newLayout.width !== flatListLayout.current.width ||
      newLayout.height !== flatListLayout.current.height
    ) {
      flatListLayout.current = newLayout
      // updateScrollState(); // Will be called by useEffect watching flatListLayout.current
    }
  }

  const handleContentSizeChange = (width: number, height: number) => {
    if (
      width !== currentContentSize.width ||
      height !== currentContentSize.height
    ) {
      setCurrentContentSize({ width, height })
    }
    // If you have specific onContentSizeChange from props, forward it
    if (flatListNativeProps.onContentSizeChange) {
      flatListNativeProps.onContentSizeChange(width, height)
    }
  }

  const scrollByOffsetPixels = (dx: number, dy: number) => {
    if (
      scrollRef.current &&
      typeof scrollRef.current.scrollToOffset === 'function'
    ) {
      const targetOffset = horizontal
        ? scrollPosition.x + dx
        : scrollPosition.y + dy
      scrollRef.current.scrollToOffset({
        offset: targetOffset,
        animated: true
      })
    } else if (
      scrollRef.current &&
      typeof scrollRef.current.scrollTo === 'function'
    ) {
      // Fallback for older versions or if scrollToOffset isn't preferred, though less direct
      scrollRef.current.scrollTo({
        x: scrollPosition.x + dx,
        y: scrollPosition.y + dy,
        animated: true
      })
    } else {
      console.warn(
        'CustomFlatList: scrollRef.current is not available or scroll methods are not functions.'
      )
    }
  }

  return (
    <View style={[styles.outerWrapper, containerStyle]}>
      {/* Shadows (same as CustomScrollView) */}
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

      <FlatList
        ref={scrollRef}
        style={[styles.scrollContent, style]}
        contentContainerStyle={contentContainerStyle}
        horizontal={horizontal}
        onScroll={handleScroll}
        onLayout={handleFlatListLayout}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        {...flatListNativeProps} // Spread all other FlatList props
      />

      {/* Arrows (use scrollByOffsetPixels) */}
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
                scrollByOffsetPixels(0, -flatListLayout.current.height * 0.8)
              }
            >
              <ChevronUp
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.light.white}
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
                scrollByOffsetPixels(0, flatListLayout.current.height * 0.8)
              }
            >
              <ChevronDown
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.light.white}
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
                scrollByOffsetPixels(-flatListLayout.current.width * 0.8, 0)
              }
            >
              <ChevronLeft
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.light.white}
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
                scrollByOffsetPixels(flatListLayout.current.width * 0.8, 0)
              }
            >
              <ChevronRight
                size={SCROLL_ARROW_ICON_SIZE}
                color={Colors.light.white}
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
