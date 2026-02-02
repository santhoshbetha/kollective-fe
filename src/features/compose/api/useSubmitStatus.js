// src/features/compose/api/useSubmitStatus.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useComposeStore } from '../store/useComposeStore';

export const useSubmitStatus = () => {
  const queryClient = useQueryClient();
  const resetCompose = useComposeStore((s) => s.resetCompose);

  return useMutation({
    mutationFn: (data: any) => api.post('/api/v1/statuses', data),
    onSuccess: () => {
      // 1. Clear the draft in Zustand
      resetCompose();
      
      // 2. Refresh the timeline so the new post appears
      queryClient.invalidateQueries({ queryKey: ['statuses', 'home'] });
      
      // 3. Update account post count
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
    },
  });
};


/*
const ComposeForm = () => {
  const { text, setText, privacy, mediaIds } = useComposeStore();
  const { mutate: submit, isPending } = useSubmitStatus();

  const handlePost = () => {
    submit({
      status: text,
      visibility: privacy,
      media_ids: mediaIds
    });
  };

  return (
    <div>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="What's happening?"
      />
      
      <button onClick={handlePost} disabled={isPending || !text.trim()}>
        {isPending ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
};

*/
//==================================================================================
//Optimistic Quote Posting
// src/features/compose/api/useSubmitStatus.js
export const useSubmitStatus = (quoteId = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.post('/api/v1/statuses', data),

    // OPTIMISTIC UPDATE
    onMutate: async (newStatusData) => {
      // 1. If we aren't quoting, skip optimistic list update
      if (!quoteId) return;

      const cacheKey = ['statuses', 'quotes', quoteId];
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previousQuotes = queryClient.getQueryData(cacheKey);

      // 2. Create a "Ghost" Status for the UI
      const optimisticStatus = {
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        content: newStatusData.status,
        account: queryClient.getQueryData(['accounts', 'me']), // Pull current user
        quote: queryClient.getQueryData(['statuses', 'detail', quoteId]),
        favourited: false,
        reblogged: false,
      };

      // 3. Prepend to the first page of the quotes infinite query
      queryClient.setQueryData(cacheKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page, i) => 
            i === 0 ? { ...page, items: [optimisticStatus, ...page.items] } : page
          ),
        };
      });

      return { previousQuotes };
    },

    onError: (err, variables, context) => {
      if (quoteId) {
        queryClient.setQueryData(['statuses', 'quotes', quoteId], context.previousQuotes);
      }
    },

    onSettled: () => {
      if (quoteId) {
        queryClient.invalidateQueries({ queryKey: ['statuses', 'quotes', quoteId] });
      }
    }
  });
};
//==================================================================================
//Self-Destructing Messages
// src/features/compose/api/useSubmitStatus.js
export const useSubmitStatus = () => {
  const queryClient = useQueryClient();
  const { expireAfter, reset } = useExpirationStore();

  return useMutation({
    mutationFn: (data) => {
      const payload = {
        status: data.text,
        visibility: 'direct',
        // REPLACES: Manual thunk logic for expiration
        ...(expireAfter && { expires_in: expireAfter }),
      };
      
      return api.post('/api/v1/statuses', payload);
    },
    onSuccess: () => {
      reset(); // Clear timer after successful send
      queryClient.invalidateQueries({ queryKey: ['conversations', 'list'] });
    }
  });
};

/*
In your Compose Bar, add a selector to set the destruction time.

const ExpirationSelector = () => {
  const { expireAfter, setExpireAfter } = useExpirationStore();

  return (
    <div className="expiration-picker">
      <ClockIcon className={expireAfter ? 'active' : ''} />
      <select 
        value={expireAfter || ''} 
        onChange={(e) => setExpireAfter(Number(e.target.value) || null)}
      >
        <option value="">Never</option>
        <option value="3600">1 Hour</option>
        <option value="86400">1 Day</option>
      </select>
    </div>
  );
};

*/
//==================================================================================
// /Automatic Alt-Text Reminders
// src/features/compose/api/useSubmitStatus.js
// Modify your useSubmitStatus mutation to prevent submission if "Enforce Alt-Text" 
// is enabled in your Settings Store.
export const useSubmitStatus = () => {
  const { attachments, getMissingAltText } = useComposeStore();
  const enforceAltText = useSettingsStore(s => s.enforceAltText);

  return useMutation({
    mutationFn: async (data) => {
      if (enforceAltText && getMissingAltText().length > 0) {
        throw new Error("Accessibility error: All images must have descriptions.");
      }
      return api.post('/api/v1/statuses', data);
    },
    onError: (err) => {
      toast.error(err.message);
    }
  });
};


