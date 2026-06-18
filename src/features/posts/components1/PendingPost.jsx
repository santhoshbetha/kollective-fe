import clsx from 'clsx';
import PostContent from './status-content';
import StatusReplyMentions from './status-reply-mentions';
import QuotedPost from './quoted-status';
import PollPreview from './poll-preview';
import Stack from './ui/stack';
import PlaceholderCard from './placeholder-card';

const shouldHaveCard = (status) => /https?:\/\/\S*/.test(status.content);

const PendingPostMedia = ({ status }) => {
  // 1. If images/video are attached
  if (status.media_attachments?.length > 0) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
        <span className="text-xs text-gray-400">Uploading Media...</span>
      </div>
    );
  } 
  
  // 2. If it's a link but not a quote, show the card skeleton
  if (!status.quote && shouldHaveCard(status)) {
    return <PlaceholderCard />;
  }

  return null;
};

const PendingStatus = ({ status, className }) => {
  if (!status) return null;

  return (
    <div className={clsx('opacity-50 grayscale pointer-events-none', className)}>
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-900/50">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src={status.account.avatar} className="w-10 h-10 rounded-full" alt="" />
          <div className="flex flex-col">
            <span className="font-bold text-sm">{status.account.display_name}</span>
            <span className="text-xs text-gray-500 italic">Sending...</span>
          </div>
        </div>

        <div className="space-y-4">
          <StatusReplyMentions status={status} />
          
          <Stack space={4}>
            <PostContent status={status} />

            <PendingPostMedia status={status} />

            {status.poll && <PollPreview poll={status.poll} />}

            {status.quote && <QuotedPost status={status.quote} />}
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default PendingStatus;

/*
Key Minimizations:

    1. Removed buildStatus: In a standalone app, your React State (or a simple Zustand store) should already 
       hold the raw object you just sent to the API. You don't need a complex "Pending Status Builder."
    2. Simplified PendingStatusMedia: Replaced the separate PlaceholderCard and PlaceholderMediaGallery 
       components with a simple Tailwind animate-pulse div. This reduces the number of files the browser 
       has to load.
    3. Removed useAppSelector: Pass the status object directly as a prop. This makes the component stateless 
       and easier to test.
    4. CSS pointer-events-none: Added this class so users can't click "Like" or "Reply" on a post that hasn't 
       officially been created in PostgreSQL yet.

    Decoupled Logic: By passing the poll object directly instead of a pollId, you don't need a Redux store to manage the "pending" state.
    Consistency: The PollPreview uses the same styling as your future interactive Poll component, giving the user an accurate "Optimistic UI" experience.
    Simplicity: No onToggle or showResults logic is needed for a pending post, keeping the component extremely lightweight.
*/

/*
How to use this with your Elixir Backend:
When the user clicks "Post" in your Composer, you add the data to your local "Pending" list immediately.

const handlePost = async (content) => {
  const optimisticId = Date.now();
  setPendingPosts(prev => [{ id: optimisticId, content, account: myAccount }, ...prev]);

  try {
    const { data } = await api.post('/api/posts', { content });
    // Replace the pending status with the real one from Elixir/Postgres
    setPosts(prev => [data, ...prev]);
  } finally {
    setPendingPosts(prev => prev.filter(p => p.id !== optimisticId));
  }
};


Why this is the "Pro" way:

    Optimistic UI: Your app feels instantaneous because the post appears (faded) the moment they hit enter.
    Data Integrity: Because the PendingStatus uses the same PostContent component we minimized earlier, 
    the text formatting will look exactly as it will once the Elixir context saves it.
*/

/*
PostgreSQL/Elixir Hint:
When you save this poll in your Elixir context, make sure to store the options as a JSONB array in your polls table.
 This makes it trivial for your PostgreSQL Triggers to handle vote counting later.
*/

/*
Would you like to see the Elixir Schema and Changeset for a Poll to see how to 
validate that a poll has at least two options?
// next in elixir.
*/
