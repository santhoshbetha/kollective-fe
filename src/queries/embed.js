import { useQuery } from '@tanstack/react-query';

import { useApi } from '../hooks/useApi';

/** Fetch OEmbed information for a status by its URL. */
// https://github.com/mastodon/mastodon/blob/main/app/controllers/api/oembed_controller.rb
// https://github.com/mastodon/mastodon/blob/main/app/serializers/oembed_serializer.rb
export default function useEmbed(url) {
  const api = useApi();

  const getEmbed = async () => {
    const response = await api.get('/api/oembed', { searchParams: { url } });
    return response.json();
  };

  return useQuery({
    queryKey: ['embed', url],
    queryFn: getEmbed,
  });
}
