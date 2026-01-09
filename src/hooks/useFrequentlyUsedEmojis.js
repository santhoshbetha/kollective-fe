import { useMemo } from 'react';

import { useSettings } from './useSettings';

/** Return a sorted list of most used emoji **shortcodes** from settings. */
export function useFrequentlyUsedEmojis() {
  const { frequentlyUsedEmojis } = useSettings();

  return useMemo(() => {
    return Object.entries(frequentlyUsedEmojis)
      .sort((a, b) => b[1] - a[1])
      .map(([emoji]) => emoji);

  }, [frequentlyUsedEmojis]);
}