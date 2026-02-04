import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/client";

//editEvent (Fetching Source for Modal)
//In TanStack, "Editing" is a two-step process:

// Fetch the raw source (Markdown/plaintext) of the status.
 //   Open the Zustand Compose Modal with that data.
export const useStatusSource = (id) => useQuery({
  queryKey: ['statuses', 'source', id],
  queryFn: () => api.get(`/api/v1/statuses/${id}/source`).then(res => res.data),
  enabled: !!id, // Only fetch when we have an ID
});

/*
// Usage in a component:
const handleEdit = async (id) => {
  // Use queryClient.fetchQuery to get data on-demand
  const source = await queryClient.fetchQuery({
    queryKey: ['statuses', 'source', id],
    queryFn: () => api.get(`/api/v1/statuses/${id}/source`).then(res => res.data),
  });
  
  // Set the Zustand store and open modal
  setComposeEvent({ 
    id, 
    text: source.text, 
    location: source.location 
  });
  openModal('COMPOSE_EVENT');
};*/

