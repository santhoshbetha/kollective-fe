import { useUnblockDomain } from '../api/useDomainActions';

// set up the Axios Interceptors in your api/client.js to ensure that if a user is 
// banned or logged out, all these new filter and status caches are wiped immediately?
const MutedDomainItem = ({ domain }) => {
  const { mutate: unblock, isPending } = useUnblockDomain();

  return (
    <div className="domain-row">
      <span>{domain}</span>
      <button 
        onClick={() => unblock(domain)} 
        disabled={isPending}
      >
        {isPending ? 'Unmuting...' : 'Unmute Domain'}
      </button>
    </div>
  );
};
