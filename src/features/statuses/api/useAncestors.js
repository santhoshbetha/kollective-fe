import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useStatusImporter } from '../hooks/useStatusImporter'; // Feature-local import

export const useAncestors = (id) => {
  const { importFetchedStatuses } = useStatusImporter();

  return useQuery({
    queryKey: ['statuses', id, 'ancestors'],
    queryFn: async () => {
      const data = await api.getAncestors(id);
      importFetchedStatuses(data); // Side-load into cache
      return data;
    },
  });
};

//===========================================================
// Example status interface
/*interface Status {
  id: string;
  in_reply_to_id: string | null;
}

interface ContextResponse {
  ancestors: Status[];
  descendants: Status[];
}*/

// Fetches the entire conversation context
const fetchContext = async (statusId) => {
  const response = await fetch(`/api/v1/statuses/${statusId}/context`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

// Maps child IDs to their parent (Ancestor logic)
export const fetchInReplyTos = async (statusId) => {
  const { ancestors, descendants } = await fetchContext(statusId);
  const inReplyToMap = new Map();
  
  // Combine all known statuses to build the parent-link map
  [...ancestors, ...descendants].forEach(status => {
    if (status.in_reply_to_id) {
      inReplyToMap.set(status.id, status.in_reply_to_id);
    }
  });
  
  return inReplyToMap;
};

// Maps parent IDs to arrays of child IDs (Descendant logic)
export const fetchReplies = async (statusId) => {
  const { descendants } = await fetchContext(statusId);
  const repliesMap = new Map();

  descendants.forEach(status => {
    if (status.in_reply_to_id) {
      const existing = repliesMap.get(status.in_reply_to_id) || [];
      repliesMap.set(status.in_reply_to_id, [...existing, status.id]);
    }
  });

  return repliesMap;
};


// Logic for finding all ancestor IDs (returns ordered Array)
const buildAncestors = (statusId, inReplyTos) => {
  const ancestors = new Set();
  let id = statusId;

  while (id && !ancestors.has(id)) {
    // Add to set to track seen IDs and prevent infinite loops
    ancestors.add(id);
    id = inReplyTos.get(id);
  }
  // Convert to Array and reverse to maintain chronological order (oldest first)
  return Array.from(ancestors).reverse();
};

// Logic for finding all descendant IDs (returns unique Array)
const buildDescendants = (statusId, contextReplies) => {
  const descendants = new Set();
  const stack = [statusId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (!id) continue;

    const replies = contextReplies.get(id);

    if (id !== statusId) {
      descendants.add(id);
    }

    if (replies) {
      // Push replies to stack for DFS; reverse for specific order if needed
      for (let i = replies.length - 1; i >= 0; i--) {
        if (!descendants.has(replies[i])) {
          stack.push(replies[i]);
        }
      }
    }
  }
  return Array.from(descendants);
};

export const useAncestors = (statusId) => {
  return useQuery({
    queryKey: ['contexts', 'inReplyTos'],
    queryFn: fetchInReplyTos, // Function to fetch your Map data
    select: (data) => buildAncestors(statusId, data),
    enabled: !!statusId,
  });
};

export const useDescendants = (statusId) => {
  return useQuery({
    queryKey: ['contexts', 'replies'],
    queryFn: fetchReplies, // Function to fetch your Map data
    select: (data) => buildDescendants(statusId, data),
  });
};


