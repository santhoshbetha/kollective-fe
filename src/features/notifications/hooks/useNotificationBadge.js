import { useEffect } from 'react';
import { useNotifications } from '../api/useNotifications';
import { updateFaviconBadge } from '@/utils/favicon';

//reate src/features/notifications/hooks/useNotificationBadge.js. 
// This hook listens to your ['notifications', 'all'] query and updates the document title and favicon automatically.
export const useNotificationBadge = () => {
  const { data } = useNotifications('all');

  // Logic: Count items that are newer than the 'lastRead' marker
  // or simply use the length of the first page for a 'recent' count
  const unreadCount = data?.pages[0]?.items.filter(n => !n.read).length || 0;

  useEffect(() => {
    // 1. Update Document Title: "Kollective (3)"
    const baseTitle = "Kollective";
    document.title = unreadCount > 0 ? `${baseTitle} (${unreadCount})` : baseTitle;

    // 2. Update Favicon
    updateFaviconBadge(unreadCount);
  }, [unreadCount]);

  return unreadCount;
};

/*
function App() {
  useNotificationBadge(); // Watcher runs in the background

  return (
    <Layout>
      <Routes />
    </Layout>
  );
}
*/
