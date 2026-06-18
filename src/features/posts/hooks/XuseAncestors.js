import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePostImporter } from './usePostImporter'; // Feature-local import

export const useAncestors = (id) => {
  const { importFetchedPosts } = usePostImporter();

  return useQuery({
    queryKey: [posts', id, 'ancestors'],
    queryFn: async () => {
      const data = await api.getAncestors(id);
      importFetchedPosts(data); // Side-load into cache
      return data;
    },
  });
};

//===========================================================
// Example post interface
/*interface Post {
  id: string;
  in_reply_to_id: string | null;
}

interface ContextResponse {
  ancestors: Post[];
  descendants: Post[];
}*/

// Fetches the entire conversation context
const fetchContext = async (postId) => {
  const response = await fetch(`/api/v1/posts/${postId}/context`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
};

// Maps child IDs to their parent (Ancestor logic)
export const fetchInReplyTos = async (postId) => {
  const { ancestors, descendants } = await fetchContext(postId);
  const inReplyToMap = new Map();
  
  // Combine all known poststo build the parent-link map
  [...ancestors, ...descendants].forEach(post => {
    if (post.in_reply_to_id) {
      inReplyToMap.set(post.id, post.in_reply_to_id);
    }
  });
  
  return inReplyToMap;
};

// Maps parent IDs to arrays of child IDs (Descendant logic)
export const fetchReplies = async (postId) => {
  const { descendants } = await fetchContext(postId);
  const repliesMap = new Map();

  descendants.forEach(post => {
    if (post.in_reply_to_id) {
      const existing = repliesMap.get(post.in_reply_to_id) || [];
      repliesMap.set(post.in_reply_to_id, [...existing, post.id]);
    }
  });

  return repliesMap;
};


// Logic for finding all ancestor IDs (returns ordered Array)
const buildAncestors = (postId, inReplyTos) => {
  const ancestors = new Set();
  let id = postId;

  while (id && !ancestors.has(id)) {
    // Add to set to track seen IDs and prevent infinite loops
    ancestors.add(id);
    id = inReplyTos.get(id);
  }
  // Convert to Array and reverse to maintain chronological order (oldest first)
  return Array.from(ancestors).reverse();
};

export const useAncestors = (postId) => {
  return useQuery({
    queryKey: ['contexts', 'inReplyTos'],
    queryFn: fetchInReplyTos, // Function to fetch your Map data
    select: (data) => buildAncestors(postId, data),
    enabled: !!postId,
  });
};

// Logic for finding all descendant IDs (returns unique Array)
const buildDescendants = (postId, contextReplies) => {
  const descendants = new Set();
  const stack = [postId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (!id) continue;

    const replies = contextReplies.get(id);

    if (id !== postId) {
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

export const useDescendants = (postId) => {
  return useQuery({
    queryKey: ['contexts', 'replies'],
    queryFn: fetchReplies, // Function to fetch your Map data
    select: (data) => buildDescendants(postId, data),
  });
};


