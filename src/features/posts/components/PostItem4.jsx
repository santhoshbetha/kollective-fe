import { useState } from 'react';
import { usePost } from '../api/usePost';
import { Repeat2, MessageCircle, Heart, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { ReplyForm } from './ReplyForm';

export const PostItem = ({ postId, conversationId, isFocused }) => {
  const { data: post, isLoading } = usePost(postId, conversationId);
  const [showFiltered, setShowFiltered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  if (isLoading) return <div className="p-4 animate-pulse bg-gray-50 h-28 mb-1" />;
  if (!post) return null;

  // Logic to determine if we should actually hide the content
  const isHidden = post.filtered && !showFiltered;

  return (
    <div className={`relative px-4 py-3 transition-all duration-200 border-b border-gray-100 
      ${isFocused ? 'bg-white ring-2 ring-blue-500 rounded-xl my-3 shadow-lg z-10' : 'bg-white hover:bg-gray-50'}`}>
      
      {/* Thread Line */}
      {!isFocused && conversationId && (
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-100 -z-10" />
      )}

      {/* Reblog/Boost Header */}
      {post.reblog && (
        <div className="flex items-center gap-2 mb-2 ml-10 text-xs font-bold text-gray-500">
          <Repeat2 size={14} className="text-green-500" />
          <span>{post.account.display_name} boosted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 z-20">
          <img 
            src={post.account.avatar} 
            className="w-11 h-11 bg-gray-200 rounded-full border-2 border-white shadow-sm" 
            alt={post.account.username}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 leading-none truncate">
                {post.account.display_name}
              </span>
              <span className="text-gray-500 text-sm">@{post.account.acct}</span>
            </div>
            
            {/* Filter Toggle Switch (Only shows if post is filtered) */}
            {post.filtered && (
              <button 
                onClick={() => setShowFiltered(!showFiltered)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] uppercase font-black transition-colors
                  ${showFiltered ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-700'}`}
              >
                {showFiltered ? <EyeOff size={12} /> : <Eye size={12} />}
                {showFiltered ? 'Hide' : 'Show'}
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="mt-2 text-[15px] leading-normal text-gray-800">
            {isHidden ? (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <ShieldAlert size={18} className="text-amber-500" />
                <span className="text-sm italic text-gray-500 font-medium">
                  Content hidden by your filters
                </span>
                <button 
                  onClick={() => setShowFiltered(true)}
                  className="ml-auto text-xs font-bold text-blue-500 hover:underline"
                >
                  Show Anyway
                </button>
              </div>
            ) : (
              <div className={`${post.filtered ? 'bg-blue-50/50 p-2 rounded border border-blue-100' : ''}`}>
                 {post.content}
              </div>
            )}
          </div>

          {/* Action Footer */}
          {!isHidden && (
            <div className="flex justify-between mt-4 max-w-sm text-gray-500">
              <button className="flex items-center gap-2 hover:text-blue-500 transition-colors group">
                <div className="p-2 group-hover:bg-blue-50 rounded-full"><MessageCircle size={18} /></div>
                <span className="text-xs">24</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
                <div className="p-2 group-hover:bg-green-50 rounded-full"><Repeat2 size={18} /></div>
                <span className="text-xs">{post.reblogs_count}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-red-500 transition-colors group">
                <div className="p-2 group-hover:bg-red-50 rounded-full"><Heart size={18} /></div>
                <span className="text-xs">{post.favourites_count}</span>
              </button>

              <button onClick={() => setIsReplying(!isReplying)}
                className={`flex items-center gap-2 transition-colors group ${isReplying ? 'text-blue-500' : 'hover:text-blue-500'}`}
                >
                <div className={`p-2 rounded-full ${isReplying ? 'bg-blue-50' : 'group-hover:bg-blue-50'}`}>
                    <MessageCircle size={18} />
                </div>
                <span className="text-xs">24</span>
              </button>

                {/* ... right before the closing </div> of the main flex container ... */}
                {isReplying && (
                    <ReplyForm 
                        postId={postId} 
                        onCancel={() => setIsReplying(false)} 
                    />
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
