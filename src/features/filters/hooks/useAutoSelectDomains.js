// src/features/filters/hooks/useAutoSelectDomains.js
import { useQueryClient } from '@tanstack/react-query';
import { useDomainSelectionStore } from '../store/useDomainSelectionStore';

// /Automatic Domain Selection
// /This hook scans the TanStack Query cache. Since the data is already fetched and normalized, this operation is near-instant.
export const useAutoSelectDomains = () => {
  const queryClient = useQueryClient();
  const selectMany = useDomainSelectionStore((s) => s.selectMany);

  const selectByPattern = (pattern) => {
    // 1. Pull the domain list directly from the cache
    const domains = queryClient.getQueryData(['filters', 'domains']) || [];

    // 2. Filter based on string matching (e.g., '.top', '.bot', 'spam')
    const matches = domains.filter(d => d.toLowerCase().includes(pattern.toLowerCase()));

    // 3. Update Zustand store
    selectMany(matches);
  };

  return { selectByPattern };
};
