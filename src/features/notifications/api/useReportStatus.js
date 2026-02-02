import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { deletePostInPages } from '@/features/statuses/utils/cacheHelpers';

export const useReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. API Call (Standard Mastodon/Pleroma Report endpoint)
    mutationFn: ({ statusId, accountId, comment, category }) => 
      api.post('/api/v1/reports', {
        status_ids: [statusId],
        account_id: accountId,
        comment: comment || 'Reported via web',
        category: category || 'spam'
      }),

    // 2. Optimistic "Hiding"
    onMutate: async ({ statusId }) => {
      // Cancel timeline fetches to prevent overwriting our hide action
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Save previous state for rollback
      const previousStatuses = queryClient.getQueryData(['statuses']);

      // Scrub the reported post from all timelines immediately
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        deletePostInPages(old, statusId)
      );

      return { previousStatuses };
    },

    // 3. Rollback on failure
    onError: (err, variables, context) => {
      queryClient.setQueryData(['statuses'], context.previousStatuses);
    },

    // 4. Cleanup
    onSuccess: () => {
      // Optional: Show a success toast
      console.log('Report submitted successfully');
    }
  });
};

/*
const ReportModal = ({ status, onClose }) => {
  const { mutate: report, isPending } = useReportStatus();

  const handleSubmit = (e) => {
    e.preventDefault();
    report({ 
      statusId: status.id, 
      accountId: status.account.id,
      comment: e.target.comment.value 
    }, {
      onSuccess: onClose // Close modal only after success
    });
  };

  return (
    <div className="report-modal">
      <h3>Report Post by @{status.account.username}</h3>
      <form onSubmit={handleSubmit}>
        <textarea name="comment" placeholder="Why are you reporting this?" />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Sending Report...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

*/
/*
Immediate Relief: The user sees the post disappear from their feed the moment they hit submit.
 In Redux, you would have had to manually orchestrate a DELETE_STATUS action alongside the REPORT_SUCCESS.
No Global State Needed: You don't need to track reportError or isReporting in a slice.
 The mutation hook provides all the state you need for that specific interaction.
Decoupled Moderation: Since reporting is a side-effect that scrubs the cache, 
you don't need a reportedStatusIds list in your store. The cache stays clean and the 
server handles the rest.
*/
