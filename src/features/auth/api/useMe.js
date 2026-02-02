import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { fetchCurrentUser } from './authApi';

export const useMe = () => {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    // CRITICAL: Only run the query if we actually have a token
    enabled: !!token, // Only fetch if we have a token!
    // Since profile data doesn't change every second, give it a long staleTime
    staleTime: 1000 * 60 * 15, // 15 minutes
    // If the user is offline, keep the last known profile
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

/*
This setup allows you to keep your src/stores/slices/authSlice.ts very slim 
(only tokens) while moving the heavy lifting of user data to TanStack Query.

const UserProfileButton = () => {
  const { data: user, isLoading, isError } = useMe();
  const token = useAuthStore(s => s.token);

  if (!token) return <LoginButton />;
  if (isLoading) return <AvatarSkeleton />;

  return (
    <div className="user-nav">
      <img src={user?.avatar} alt={user?.username} />
      <span>{user?.display_name}</span>
    </div>
  );
};
*/