// src/features/auth/hooks/useMe.js
import { useQuery } from '@tanstack/react-query';
import { useMeStore } from '../store/useMeStore';

export const useMe = () => {
  const { setMe, accessToken } = useMeStore();

  return useQuery({
    queryKey: ['accounts', 'me'],
    queryFn: () => api.get('/api/v1/accounts/verify_credentials').then(res => res.data),
    onSuccess: (data) => setMe(data),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 30, // Verify every 30 mins
  });
};

/*
// replacing selectOwnAccount
const ProfileWidget = () => {
  // Replaces: useSelector(state => selectOwnAccount(state))
  const me = useMeStore((s) => s.me);

  if (!me) return null;

  return (
    <div className="me-widget">
      <img src={me.avatar} alt={me.display_name} />
      <span>@{me.username}</span>
    </div>
  );
};

*/
