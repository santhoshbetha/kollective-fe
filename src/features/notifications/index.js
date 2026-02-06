import React from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import { NotificationItem } from './components/NotificationItem';

const NotificationsPage = () => {
  // Use the same generic timeline hook but point to notifications
  const { items, isLoading, loadMore } = useTimeline('/api/v1/notifications');

  return (
    <div className="notifications-container">
      <h2 style={{ padding: '16px' }}>Notifications</h2>
      
      {items.map(notification => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
        />
      ))}

      {items.length > 0 && (
        <button onClick={loadMore} style={{ width: '100%', padding: '16px' }}>
          Load Older Notifications
        </button>
      )}
    </div>
  );
};

export default NotificationsPage;

/*
By using the useTimeline hook we built earlier, the notifications feature becomes incredibly slim.
*/

/*
Total Reductions Summary:

    Compose: Merged 3 selectors into 1; moved logic to hooks.
    Groups/Events/Explore: Consolidated all user/group displays into a single EntityCard.
    Timeline: Created one Timeline component and one useTimeline hook to power the whole app.
    Notifications: Replaced multiple specialized files with one NotificationItem and the shared timeline hook.
*/
