import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { deletePostInPages } from '@/features/statuses/utils/cacheHelpers';
import { toast } from '@/components/Toast';

export const useReportStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The API Call
    mutationFn: (data) => 
      api.post('/api/v1/reports', {
        status_ids: [data.statusId],
        account_id: data.accountId,
        comment: data.comment,
        category: data.category,
      }),

    // 2. Optimistic "Clean Feed"
    onMutate: async ({ statusId }) => {
      // Cancel outgoing fetches so they don't overwrite our "hide" action
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // Save previous state for rollback
      const previousData = queryClient.getQueryData(['statuses']);

      // Scrub the reported post from all timelines immediately
      queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => 
        deletePostInPages(old, statusId)
      );

      return { previousData };
    },

    // 3. Rollback on failure
    onError: (err, variables, context) => {
      queryClient.setQueryData(['statuses'], context?.previousData);
      toast.error("Failed to send report. Please try again.");
    },

    // 4. Final Success Side-Effect
    onSuccess: () => {
      toast.success("Report submitted. We've hidden this post for you.");
    }
  });
};

//===============================================================================================
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export const useSubmitReport = () => {
  return useMutation({
    mutationFn: (reportData) => {
      // Logic Port: Convert your state into the API payload
      const payload = {
        account_id: reportData.accountId,
        status_ids: reportData.statusIds,
        message_ids: [reportData.chatMessageId].filter(Boolean),
        group_id: reportData.groupId,
        rule_ids: reportData.ruleIds,
        comment: reportData.comment,
        forward: reportData.forward,
      };

      return api.post('/api/v1/reports', payload);
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Thank you for helping keep the community safe.");
    },
    onError: (error) => {
      toast.error("Failed to submit report. Please try again.");
    }
  });
};

//===============================================================================================
//"Optimistic Hiding"
//To implement Optimistic Hiding, you update the cache to scrub the reported content the moment 
// the user clicks "Submit." This provides immediate relief from the offending content while the 
// API request processes in the background.
// src/features/moderation/api/useReport.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePostInPages } from '@/features/statuses/utils/cacheHelpers';

export const useSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportData) => api.post('/api/v1/reports', reportData),

    // OPTIMISTIC UI: Scrub the reported posts from the feed immediately
    onMutate: async (reportData) => {
      // 1. Cancel outgoing timeline refetches
      await queryClient.cancelQueries({ queryKey: ['statuses'] });

      // 2. Snapshot current state for rollback
      const previousTimelines = queryClient.getQueriesData({ queryKey: ['statuses'] });

      // 3. Remove the reported statuses from all cached pages
      if (reportData.status_ids?.length > 0) {
        queryClient.setQueriesData({ queryKey: ['statuses'] }, (old) => {
          if (!old || !old.pages) return old;
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              items: page.items.filter(status => !reportData.status_ids.includes(status.id))
            }))
          };
        });
      }

      return { previousTimelines };
    },

    // If the server fails, restore the posts (though usually, users prefer them gone)
    onError: (err, variables, context) => {
      queryClient.setQueriesData({ queryKey: ['statuses'] }, context.previousTimelines);
    },
  });
};
/*
const ReportModal = () => {
  const { newReport, resetReport } = useReportStore();
  const { mutate: submit, isPending } = useSubmitReport();

  const handleSubmit = () => {
    submit(newReport, {
      onSuccess: () => {
        resetReport(); // Clear the form
        closeModal();  // Use the global modal store we built
      }
    });
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Sending...' : 'Confirm Report'}
    </button>
  );
};

*/




