/**
 * Icon: abstract component to render SVG icons.
 * @module soapbox/components/icon
 */

import clsx from 'clsx';
import { forwardRef } from 'react';
import InlineSVG from 'react-inlinesvg'; // eslint-disable-line no-restricted-imports

export interface IIcon extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  id?: string;
  alt?: string;
  className?: string;
}

/**
 * @deprecated Use the UI Icon component directly.
 */
const Icon = forwardRef<HTMLDivElement, IIcon>(({ src, alt, className, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('flex size-4 items-center justify-center transition duration-200', className)}
      {...rest}
    >
      <InlineSVG className='size-full transition duration-200' src={src} title={alt} loader={<></>} />
    </div>
  );
});

Icon.displayName = 'Icon';

export default Icon;
