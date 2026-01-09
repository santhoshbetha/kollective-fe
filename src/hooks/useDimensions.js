import { useEffect, useMemo, useState } from 'react';

const useDimensions = () => {
  const [element, setRef] = useState(null);
  const [rect, setRect] = useState({ width: 0, height: 0 });

  const observer = useMemo(
    () =>
      new ResizeObserver((entries) => {
        if (entries[0]) {
          const { width, height } = entries[0].contentRect;
          setRect({ width, height });
        }
      }),
    [],
  );

  useEffect(() => {
    if (!element) return;
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [element]);

  return [element, setRef, rect];
};

export { useDimensions };
