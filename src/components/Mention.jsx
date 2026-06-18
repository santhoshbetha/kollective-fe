import { Link } from 'react-router-dom';
import { Tooltip } from '@/components/ui/tooltip.tsx';

/** Mention for display in post content and the composer. */
const Mention = ({ mention: { acct, username }, disabled }) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
    }
    e.stopPropagation();
  };

  return (
    <Tooltip text={`@${acct}`}>
      <Link
        to={`/@${acct}`}
        className='text-primary-600 hover:underline dark:text-accent-blue'
        onClick={handleClick}
        dir='ltr'
      >
        @{username}
      </Link>
    </Tooltip>
  );
};

export default Mention;