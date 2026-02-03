// src/features/groups/hooks/useGroupAdminWatcher.js
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

//"Global Admin Notification"

// To implement a Global Admin Notification for group membership requests, you treat the Kollective API as a 
// "background watcher." You don't need a Redux slice; instead, you use a high-level hook that polls
//  for pending requests and updates a Zustand badge count or shows a toast.

// The Global Watcher Hook
// This hook runs in the background. It fetches the "List of Groups" you manage and checks 
// if any have a membership_requests_count > 0.
export const useGroupAdminWatcher = () => {
  return useQuery({
    queryKey: ['groups', 'admin-watch'],
    queryFn: async () => {
      // 1. Fetch groups where you have admin permissions
      const { data } = await api.get('/api/v1/groups', { params: { admin: true } });
      
      // 2. Count total pending requests across all managed groups
      const totalPending = data.reduce((acc, group) => 
        acc + (group.membership_requests_count || 0), 0
      );

      return { groups: data, totalPending };
    },
    // Poll every 2 minutes to keep the badge updated
    refetchInterval: 1000 * 60 * 2, 
    // Only poll if the user is logged in
    enabled: !!localStorage.getItem('access_token'),
  });
};

/*
The UI Badge (Navbar)
In your Navbar component, you can now show a red dot if there are pending actions.
const AdminLink = () => {
  const { data } = useGroupAdminWatcher();

  return (
    <Link href="/groups/admin" className="nav-item">
      <span>Groups</span>
      {data?.totalPending > 0 && (
        <span className="badge-notification">{data.totalPending}</span>
      )}
    </Link>
  );
};

*/

/*
3. Real-time Toasts for New Requests
const previousCount = useRef(0);

useEffect(() => {
  if (data?.totalPending > previousCount.current) {
    toast.info(`You have ${data.totalPending} new group membership requests!`);
  }
  previousCount.current = data?.totalPending || 0;
}, [data?.totalPending]);
*/
