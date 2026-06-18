import clsx from "clsx";
// Simplified Avatar
const PlaceholderAvatar = ({ size = 42, className }) => (
  <div 
    className={clsx('rounded-full bg-gray-200 dark:bg-gray-800 shrink-0', className)} 
    style={{ width: size, height: size }} 
  />
);

export default PlaceholderAvatar;
