// src/components/Navigation/ExploreLink.jsx
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';

const ExploreLink = () => {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    // Proactively fetch trends before the user clicks
    queryClient.prefetchQuery({
      queryKey: ['trends', 'tags'],
      queryFn: () => api.get('/api/v1/trends').then(res => res.data),
      staleTime: 1000 * 60 * 5, // Consider it fresh for 5 mins
    });
  };

  return (
    <Link to="/explore" onMouseEnter={handleMouseEnter}>
      Explore
    </Link>
  );
};
