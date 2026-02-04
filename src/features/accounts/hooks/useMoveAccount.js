import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

//Move Automation
export const useMoveAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. Trigger the move on the server
    mutationFn: (targetAccountId) => 
      api.patch('/api/v1/accounts/update_credentials', {
        move_to_account_id: targetAccountId
      }),
    
    onSuccess: () => {
      // 2. Nuclear Reset: Force logout and refresh after a move
      toast.success("Account move initiated. Your followers are being redirected.");
      queryClient.invalidateQueries({ queryKey: ['accounts', 'me'] });
      // Usually, you'd logout or redirect to a 'Moving' status page
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || "Account move failed.");
    }
  });
};

/*
const AccountMoveWizard = ({ targetAcct }) => {
  const myApId = useAuthStore(s => s.me?.kollective?.ap_id);
  
  // 1. Watch for verification
  const { data: verification, isLoading } = useAliasVerification(targetAcct, myApId);
  const { mutate: startMove, isPending } = useMoveAccount();

  return (
    <div className="move-wizard">
      <AliasVerificationRow targetAcct={targetAcct} myApId={myApId} />
      
      <button
        // AUTOMATION: Only clickable if verified by the TanStack Cache
        disabled={!verification?.isVerified || isPending || isLoading}
        onClick={() => startMove(verification.account.id)}
        className="btn-danger"
      >
        {isPending ? 'Processing Move...' : 'Move to New Account'}
      </button>

      {!verification?.isVerified && !isLoading && (
        <p className="hint">
          You must add this account as an alias on your <strong>new</strong> instance first.
        </p>
      )}
    </div>
  );
};

*/
//=============================================================================
// /Success Confetti
// src/features/accounts/api/useMoveAccount.js
import { fireConfetti } from '@/utils/confetti';

export const useMoveAccount = () => {
  return useMutation({
    mutationFn: (targetId) => api.patch('/api/v1/accounts/update_credentials', { 
      move_to_account_id: targetId 
    }),
    onSuccess: () => {
      // Celebrate the successful migration!
      fireConfetti();
      toast.success("Account move successful!");
    }
  });
};


