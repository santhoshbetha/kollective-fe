import { useUnblockAccount } from "../api/useAccountActions";

//Optimistic Unblock mutation
const UnblockButton = ({ accountId }) => {
  const { mutate: unblock, isPending } = useUnblockAccount();

  return (
    <button 
      onClick={() => unblock(accountId)} 
      disabled={isPending}
      className="btn-unblock"
    >
      {isPending ? 'Unblocking...' : 'Unblock'}
    </button>
  );
};

export default UnblockButton;