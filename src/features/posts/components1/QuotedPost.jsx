import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';

import StatusMedia from './status-media';
import PostContent from './status-content';
import QuotedPostIndicator from './quoted-status-indicator';
import SensitiveContentOverlay from './sensitive-content-overlay';
import Stack from './ui/stack';
import OutlineBox from './outline-box';

const QuotedPost = ({ status, onCancel, compose }) => {
  const history = useHistory();
  const [showMedia, setShowMedia] = useState(false);

  if (!status) return null;

  const isSensitive = status.sensitive || !!status.spoiler_text;

  const handleNavigate = (e) => {
    if (compose) return;
    const url = `/@${status.account.acct}/posts/${status.id}`;
    if (e.ctrlKey || e.metaKey) {
      window.open(url, '_blank');
    } else {
      history.push(url);
    }
  };

  return (
    <OutlineBox
      className={clsx('cursor-pointer relative overflow-hidden', {
        'hover:bg-gray-50 dark:hover:bg-gray-800': !compose,
      })}
      onClick={handleNavigate}
    >
      <Stack space={3}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center min-w-0">
            <img src={status.account.avatar} className="w-5 h-5 rounded-full shrink-0" alt="" />
            <span className="font-bold text-sm truncate dark:text-gray-200">
              {status.account.display_name}
            </span>
          </div>
          {onCancel && (
            <button 
              onClick={(e) => { e.stopPropagation(); onCancel(); }} 
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="relative">
          {isSensitive && (
            <SensitiveContentOverlay 
              status={status} 
              visible={showMedia} 
              onToggleVisibility={() => setShowMedia(!showMedia)} 
            />
          )}

          <Stack space={3}>
            <PostContent status={status} collapsable />

            {/* Nested Quote Indicator - Triggered if this quote contains another quote */}
            {status.quote && (
              <QuotedPostIndicator status={status.quote} />
            )}

            {status.media_attachments?.length > 0 && (
              <StatusMedia
                status={status}
                muted={compose}
                showMedia={showMedia || !isSensitive}
                onToggleVisibility={() => setShowMedia(!showMedia)}
              />
            )}
          </Stack>
        </div>
      </Stack>
    </OutlineBox>
  );
};

export default QuotedPost;


/*
1. Removed AccountContainer: Swapped a heavy container for a simple div with an avatar and name. 
   In a standalone app, you don't need complex remote-account fetching.
2. Eliminated useEffect & getBoundingClientRect: Removed the logic used to calculate heights for 
   Sensitive Content Overlays. For a standalone app, simple CSS aspect-ratio or min-height on the media container is more efficient.
3. Removed intl (Internationalization): Replaced defineMessages with direct strings. 
   If you need multi-language support, keep intl, but for a lean build, it's the first thing to go.
4. Prop Drilling: Removed the overlay ref and Stack wrapper for the sensitive content logic, 
   relying instead on a simple state toggle for showMedia.
5. Cleaned up actions: Replaced the complex action object logic with a simple conditional button for 
   the "Cancel" (close) action.
*/

