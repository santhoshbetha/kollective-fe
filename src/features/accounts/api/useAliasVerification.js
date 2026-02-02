import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

//"Alias Verification"
//To implement Alias Verification (ensuring the account you are moving to has a reciprocal "Also Known As" link back to your current account), you create a query that fetches the remote account's metadata and validates it using Zod.
//Create src/features/accounts/api/useAliasVerification.js. This hook checks if a potential alias target is actually pointing back to the user, preventing "one-way" or unauthorized move attempts.
export const useAliasVerification = (targetAcct, myApId) => {
  return useQuery({
    queryKey: ['accounts', 'verify-alias', targetAcct],
    queryFn: async () => {
      // 1. Fetch the remote account details
      const { data } = await api.get('/api/v1/accounts/lookup', {
        params: { acct: targetAcct }
      });

      // 2. Check for reciprocal "Also Known As" (AP ID link)
      const aka = data.pleroma?.also_known_as || data.also_known_as || [];
      const isVerified = aka.includes(myApId);

      return {
        account: data,
        isVerified,
        // If not verified, the move will fail on the server anyway
        error: !isVerified ? 'Target account does not point back to this account.' : null
      };
    },
    enabled: !!targetAcct && !!myApId,
    staleTime: 1000 * 60 * 5, // Cache verification for 5 mins
  });
};

/*
const AliasVerificationRow = ({ targetAcct, myApId }) => {
  const { data, isLoading } = useAliasVerification(targetAcct, myApId);

  if (!targetAcct) return null;
  if (isLoading) return <Spinner size="sm" />;

  return (
    <div className={`verification-badge ${data.isVerified ? 'success' : 'warning'}`}>
      {data.isVerified ? (
        <span>✅ Verified: {targetAcct} is ready for move.</span>
      ) : (
        <span>⚠️ Warning: {data.error}</span>
      )}
    </div>
  );
};

*/