import React from 'react';
import { Svg, Path } from 'react-native-svg';

export function FlameIcon(props: React.ComponentProps<typeof Svg>) {
  return (
    <Svg
      viewBox="0 0 20 20"
      fill="currentColor"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.395 2.553a1 1 0 0 0-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31 31 0 0 0-.613 3.58 2.64 2.64 0 0 1-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 0 0 5.05 6.05 6.98 6.98 0 0 0 3 11a7 7 0 1 0 11.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03M12.12 15.12A3 3 0 0 1 7 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A3 3 0 0 1 13 13a3 3 0 0 1-.879 2.121z"
      />
    </Svg>
  );
}