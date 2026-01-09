import { useStatContext } from '../../contexts/stat-context.jsx';
import { useLoggedIn } from '../../hooks/useLoggedIn.js';

import { useTimelineStream } from './useTimelineStream.js';

function useUserStream() {
  const { isLoggedIn } = useLoggedIn();
  const statContext = useStatContext();

  return useTimelineStream(
    'home',
    'user',
    null,
    { statContext, enabled: isLoggedIn },
  );
}

export { useUserStream };