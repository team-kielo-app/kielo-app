import React from 'react'
import { Svg, Path } from 'react-native-svg'

export function CircleEllipsisIcon(props: React.ComponentProps<typeof Svg>) {
  return (
    <Svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16M7 9H5v2h2zm8 0h-2v2h2zM9 9h2v2H9z"
      />
    </Svg>
  )
}
