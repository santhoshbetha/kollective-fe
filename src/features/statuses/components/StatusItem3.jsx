import { useStatus } from '../api/useStatus';

export const StatusItem = ({ statusId, conversationId, isFocused }) => {
  const { data: status, isLoading } = useStatus(statusId, conversationId);

  if (isLoading) return <div className="p-4 animate-pulse bg-gray-50 h-24 mb-1" />;
  if (!status) return null;

  return (
    <div 
      className={`
        relative px-4 py-3 transition-colors duration-200 border-b border-gray-100
        ${isFocused ? 'bg-white ring-2 ring-blue-500 rounded-xl my-3 shadow-md z-10' : 'bg-white hover:bg-gray-50'}
        ${status.filtered ? 'opacity-60 grayscale' : ''}
      `}
    >
      {/* Thread Line - only show if part of a conversation and not focused */}
      {!isFocused && conversationId && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />
      )}

      {/* Reblog/Boost Header */}
      {status.reblog && (
        <div className="flex items-center gap-2 mb-1 ml-6 text-xs font-semibold text-gray-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="Path for Boost Icon" />
          </svg>
          <span>{status.account.display_name} boosted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar Placeholder */}
        <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
           <img src={status.account.avatar} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: Name and Handle */}
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="font-bold text-gray-900 truncate">
              {status.account.display_name || status.account.username}
            </span>
            <span className="text-gray-500 truncate text-sm">
              @{status.account.acct}
            </span>
          </div>

          {/* Content */}
          <div className={`mt-1 text-[15px] leading-normal text-gray-800 break-words ${status.filtered ? 'blur-sm select-none' : ''}`}>
             {status.filtered ? "This content matches your filters" : status.content}
          </div>

          {/* Footer: Actions (Placeholder) */}
          {!status.filtered && (
            <div className="flex justify-between mt-3 max-w-xs text-gray-400">
               <button className="hover:text-blue-500 transition-colors">Reply</button>
               <button className="hover:text-green-500 transition-colors">Boost</button>
               <button className="hover:text-red-500 transition-colors">Fav</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/*
animate-pulse: Handles the loading state with a smooth ghosting effect.
ring-2 ring-blue-500: Creates a sharp focus border without shifting the layout (unlike a standard border).
break-words: Essential for social media content to prevent long URLs from breaking the layout.
-z-10 + absolute: Used on the vertical line to create the "thread" appearance behind the avatars.
blur-sm: Applies the filter effect based on your select logic results.
*/
