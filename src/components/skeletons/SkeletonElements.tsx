import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native'
import { Colors } from '@constants/Colors'

const SKELETON_COLOR = Colors.light.border
const HIGHLIGHT_COLOR = Colors.light.backgroundLight

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: ViewStyle
  children?: React.ReactNode
}

export const SkeletonBase: React.FC<SkeletonProps> = React.memo(
  ({ width = '100%', height = 20, borderRadius = 4, style, children }) => {
    const pulseAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      const sharedAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      )
      sharedAnimation.start()
      return () => sharedAnimation.stop()
    }, [pulseAnim])

    const interpolatedOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 1]
    })

    return (
      <Animated.View
        style={[
          styles.base,
          { width, height, borderRadius },
          { opacity: interpolatedOpacity },
          style
        ]}
      >
        {children}
      </Animated.View>
    )
  }
)

export const SkeletonBlock: React.FC<SkeletonProps> = React.memo(props => {
  return <SkeletonBase {...props} />
})

export const SkeletonCircle: React.FC<
  Omit<SkeletonProps, 'borderRadius'> & { size: number }
> = React.memo(({ size, style, ...props }) => {
  return (
    <SkeletonBase
      {...props}
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  )
})

const styles = StyleSheet.create({
  base: {
    backgroundColor: SKELETON_COLOR,
    overflow: 'hidden'
  }
})
