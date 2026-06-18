import clsx from 'clsx';

/** 
 * A simple container with a border. 
 * Forwarding `...rest` allows it to handle `onClick` or `id` from parents.
 */
const OutlineBox = ({ children, className, ...rest }) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-solid border-gray-300 p-4 dark:border-gray-800', 
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default OutlineBox;
