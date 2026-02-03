import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

//submitEvent
// This thunk is not required. In the new architecture, you replace the entire "request/success/fail" 
// lifecycle and the manual compose_event state with a TanStack Mutation.
//Instead of pulling values from a Redux slice, you pass the form data directly to the mutation.
// This allows you to delete the submitEventRequest, Success, and Fail actions.

//The Migration Mutation
//Create this in src/features/events/api/useSubmitEvent.js.

export const useSubmitEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // REPLACES: The conditional POST/PUT logic
    mutationFn: async (eventData) => {
      const { id, ...params } = eventData;
      const method = id ? 'PUT' : 'POST';
      const path = id ? `/api/v1/kollective/events/${id}` : '/api/v1/kollective/events';

      const response = await api.request(method, path, params);
      return response.data;
    },

    // REPLACES: submitEventSuccess
    onSuccess: (data, variables) => {
      const isEditing = !!variables.id;

      // 1. Refresh the event lists
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      // 2. If it's a detail view, update that specific cache
      queryClient.setQueryData(['events', 'detail', data.id], data);

      // 3. Side-load the status (replaces importFetchedStatus)
      queryClient.setQueryData(['statuses', data.id], data);

      // 4. UI Side-effects
      toast.success(isEditing ? "Event updated!" : "Event created!", {
        action: {
          label: "View",
          onClick: () => window.location.href = `/@${data.account.acct}/events/${data.id}`
        }
      });
    }
  });
};

/*
 Why this is a "Redux-Killer" for Events:

    Form Logic: Instead of state.compose_event.name, use a simple React Hook Form or local useState. Only the final "Submit" needs to hit the global logic.
    Modal Management: Use the Zustand modal store we built earlier. In the onSuccess block of the mutation, simply call closeModal().
    Automatic Loading UI: The mutation hook provides isPending, so you can disable your "Save" button without a manual submitEventRequest action.
    Error Handling: The error object returned by the hook contains the API error, removing the need for submitEventFail.
*/
