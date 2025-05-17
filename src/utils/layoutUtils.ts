// src/utils/layoutUtils.ts (New File)
import { findNodeHandle, UIManager, View } from 'react-native'
import React from 'react'

export interface LayoutMeasurement {
  x: number
  y: number
  width: number
  height: number
  pageX: number // Screen X
  pageY: number // Screen Y
}

export const measureNode = (
  ref: React.RefObject<View | Text>
): Promise<LayoutMeasurement> => {
  return new Promise(resolve => {
    if (ref.current) {
      const nodeHandle = findNodeHandle(ref.current)
      if (nodeHandle) {
        UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
          resolve({ x, y, width, height, pageX, pageY })
        })
      } else {
        resolve({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 }) // Fallback
      }
    } else {
      resolve({ x: 0, y: 0, width: 0, height: 0, pageX: 0, pageY: 0 }) // Fallback
    }
  })
}
