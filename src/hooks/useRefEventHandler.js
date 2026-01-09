import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook that returns a stable event handler which always calls the latest
 * provided function. This lets you pass a stable function to event props
 * while reading the freshest values from closures.
 * See: https://stackoverflow.com/a/64770671/8811886
 */
export const useRefEventHandler = (fn) => {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args) => {
    const current = ref.current;
    if (typeof current === 'function') return current(...args);
  }, []);
};
