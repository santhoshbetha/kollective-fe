import { useRelationship, usePinAccount } from "../api/useRelationships";

const AccountMenu = ({ accountId }) => {
  const { data: rel } = useRelationship(accountId);
  const { mutate: togglePin, isPending } = usePinAccount();

  const isPinned = rel?.pinned;

  return (
    <button 
      onClick={() => togglePin({ id: accountId, pin: !isPinned })}
      disabled={isPending}
    >
      {isPending ? '...' : (isPinned ? 'Unpin from profile' : 'Pin to profile')}
    </button>
  );
};

export default AccountMenu;