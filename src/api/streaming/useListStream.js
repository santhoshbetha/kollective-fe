import { useLoggedIn } from '../../hooks/useLoggedIn.js';

import { useTimelineStream } from './useTimelineStream.js';

function useListStream(listId) {
  const { isLoggedIn } = useLoggedIn();

  return useTimelineStream(
    `list:${listId}`,
    `list&list=${listId}`,
    null,
    { enabled: isLoggedIn },
  );
}

export { useListStream };