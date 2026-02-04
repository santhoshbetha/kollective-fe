// src/features/instance/api/useCustomEmojis.js
export const useCustomEmojis = () => {
  return useQuery({
    queryKey: ['instance', 'emojis'],
    queryFn: () => api.get('/api/v1/custom_emojis').then(res => res.data),
    staleTime: Infinity,
    select: (emojis) => {
      // Grouping logic: replaces complex Redux selectors
      return emojis.reduce((acc, emoji) => {
        const category = emoji.category || 'Custom';
        if (!acc[category]) acc[category] = [];
        acc[category].push(emoji);
        return acc;
      }, {});
    }
  });
};


/*
const AuthButtons = () => {
  const { data: instance, isLoading } = useInstance();

  if (isLoading) return null;

  return (
    <div>
      <button>Login</button>
      {/* Ported Logic: Only show Signup if the instance allows it *//*}
      {instance?.registrations.enabled && (
        <button className="btn-primary">Create Account</button>
      )}
    </div>
  );
};

*/
/*
Server Data	TanStack Query	Automatic caching, pagination, and invalidation.
Auth/Tokens	Zustand	Lightweight, persistent client-state.
Data Integrity	Zod	Validates API responses before they hit the UI.
Side Effects	Cache Importers	Synchronizes entities across multiple feeds.
*/
//====================================================================================================