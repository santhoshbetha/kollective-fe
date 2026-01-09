import { useLoggedIn } from '../../hooks/useLoggedIn.js';
import { useTimelineStream } from './useTimelineStream.js';

function useDirectStream() {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    'direct',
    'direct',
    null,
    { enabled: isLoggedIn },
  );
}

export { useDirectStream };