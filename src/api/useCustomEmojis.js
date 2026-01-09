import { useQuery } from '@tanstack/react-query';

import { autosuggestPopulate } from '../features/emoji/search.js';
import { useApi } from '../hooks/useApi.js';
import { customEmojiSchema } from '../schemas/custom-emoji.js';
import { filteredArray } from '../schemas/utils.js';

/** Get the Instance for the current backend. */
export function useCustomEmojis() {
  const api = useApi();

  const { data: customEmojis = [], ...rest } = useQuery({
    queryKey: ['customEmojis', api.baseUrl],
    queryFn: async () => {
      const response = await api.get('/api/v1/custom_emojis');
      const data = await response.json();
      const customEmojis = filteredArray(customEmojiSchema).parse(data);

      // Add custom emojis to the search index.
      autosuggestPopulate(customEmojis);

      return customEmojis;
    },
    placeholderData: [],
    retryOnMount: false,
  });

  return { customEmojis, ...rest };
}
