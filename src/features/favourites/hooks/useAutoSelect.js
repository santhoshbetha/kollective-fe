// src/features/favourites/hooks/useAutoSelect.js
import { useQueryClient } from '@tanstack/react-query';
import { useSelectionStore } from '../store/useSelectionStore';
import { subDays, isAfter } from 'date-fns';

//Create a utility hook to filter the cached data. Since the data is 
// already transformed and stored by TanStack, this operation is near-instant.
export const useAutoSelect = (accountId = 'mine') => {
  const queryClient = useQueryClient();
  const selectMany = useSelectionStore((s) => s.selectMany);

  const selectRecent = (days = 7) => {
    // 1. Pull the current infinite query data from the cache
    const cacheKey = ['statuses', 'timeline', 'favourites', accountId];
    const cachedData = queryClient.getQueryData(cacheKey);

    if (!cachedData) return;

    const cutoff = subDays(new Date(), days);

    // 2. Flatten all pages and filter by date
    const recentIds = cachedData.pages
      .flatMap((page) => page.items)
      .filter((status) => isAfter(new Date(status.created_at), cutoff))
      .map((status) => status.id);

    // 3. Update Zustand store
    selectMany(recentIds);
  };

  return { selectRecent };
};

/*
const SelectionToolbar = () => {
  const { selectRecent } = useAutoSelect();
  const { isSelectionMode, toggleSelectionMode } = useSelectionStore();

  if (!isSelectionMode) return <button onClick={toggleSelectionMode}>Bulk Edit</button>;

  return (
    <div className="selection-controls">
      <button onClick={() => selectRecent(7)}>Select Last 7 Days</button>
      <button onClick={toggleSelectionMode}>Cancel</button>
    </div>
  );
};

*/
//==================================================================================
// "Select by Media Type"
//To implement "Select by Media Type" (e.g., "Select all posts containing videos"), you expand your 
// logic hook to scan the media_attachments property of the statuses already stored in your TanStack Query cache.

// src/features/favourites/hooks/useAutoSelect.js
export const useAutoSelect = (accountId = 'mine') => {
  const queryClient = useQueryClient();
  const selectMany = useSelectionStore((s) => s.selectMany);

  const selectByType = (type) => { // 'video', 'image', 'gifv'
    const cacheKey = ['statuses', 'timeline', 'favourites', accountId];
    const cachedData = queryClient.getQueryData(cacheKey);

    if (!cachedData) return;

    // 1. Flatten pages and find posts where ANY attachment matches the type
    const matchingIds = cachedData.pages
      .flatMap((page) => page.items)
      .filter((status) => 
        status.media_attachments.some((media) => media.type === type)
      )
      .map((status) => status.id);

    // 2. Update Zustand store
    selectMany(matchingIds);
  };

  return { selectByType };
};

/*
const SelectionToolbar = () => {
  const { selectByType } = useAutoSelect();
  const { isSelectionMode, selectedIds } = useSelectionStore();

  if (!isSelectionMode) return null;

  return (
    <div className="filter-selection-bar">
      <button onClick={() => selectByType('video')}>Select All Videos</button>
      <button onClick={() => selectByType('image')}>Select All Images</button>
      
      <span className="count">{selectedIds.length} items selected</span>
    </div>
  );
};

*/
//==================================================================================
//"Select by Hashtag"
//Add selectByHashtag to your utility hook. This allows users 
// to bulk-manage posts related to specific topics (e.g., "#art" or "#politics").
// src/features/favourites/hooks/useAutoSelect.js
export const useAutoSelect = (accountId = 'mine') => {
  const queryClient = useQueryClient();
  const selectMany = useSelectionStore((s) => s.selectMany);

  const selectByHashtag = (tagName) => {
    const cacheKey = ['statuses', 'timeline', 'favourites', accountId];
    const cachedData = queryClient.getQueryData(cacheKey);

    if (!cachedData) return;

    const normalizedTag = tagName.toLowerCase().replace('#', '');

    // 1. Scan the pre-validated 'tags' array in each status
    const matchingIds = cachedData.pages
      .flatMap((page) => page.items)
      .filter((status) => 
        status.tags?.some((tag) => tag.name.toLowerCase() === normalizedTag)
      )
      .map((status) => status.id);

    selectMany(matchingIds);
  };

  return { selectByHashtag };
};
/*
const HashtagSelector = () => {
  const [tag, setTag] = useState('');
  const { selectByHashtag } = useAutoSelect();

  return (
    <div className="tag-selector">
      <input 
        type="text" 
        placeholder="Type tag to select..." 
        value={tag} 
        onChange={(e) => setTag(e.target.value)}
      />
      <button onClick={() => selectByHashtag(tag)}>Select #</button>
    </div>
  );
};

*/

