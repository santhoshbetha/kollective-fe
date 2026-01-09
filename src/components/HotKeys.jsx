import { HotKeys as _HotKeys } from '@mkljczk/react-hotkeys';
import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * Wrapper component around `react-hotkeys`.
 * `react-hotkeys` is a legacy component, so confining its import to one place is beneficial.
 */
const HotKeys = forwardRef(({ children, ...rest }, ref) => {
  const hotkeysRef = useRef();

  useImperativeHandle(ref, () => hotkeysRef.current);

  return (
    <_HotKeys {...rest} ref={hotkeysRef}>
      {children}
    </_HotKeys>
  );
});

export { HotKeys };