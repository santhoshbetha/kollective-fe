import React from 'react';
import { EntityCard } from '../../../components/EntityCard';

const NOTIFICATION_META = {
  favourite: { icon: '★', label: 'favourited your post', color: 'orange' },
  reblog: { icon: '🔄', label: 'boosted your post', color: 'green' },
  follow: { icon: '👤', label: 'followed you', color: 'blue' },
  mention: { icon: 'at', label: 'mentioned you', color: 'purple' },
};

export const NotificationItem = ({ notification }) => {
  const meta = NOTIFICATION_META[notification.type] || {};

  return (
    <div className="notification-wrapper" style={{ borderBottom: '1px solid #eee' }}>
      {/* 1. The "Action" indicator */}
      <div style={{ padding: '8px 16px', fontSize: '12px', color: meta.color }}>
        <span>{meta.icon}</span> {notification.account.display_name} {meta.label}
      </div>

      {/* 2. Reuse EntityCard for the account info */}
      

      {/* 3. If it's a mention or fav, show a snippet of the post */}
      {notification.status && (
        <div style={{ padding: '0 16px 16px 64px', opacity: 0.7, fontSize: '14px' }}>
          {notification.status.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
        </div>
      )}
    </div>
  );
};

/*
Instead of separate files, use a single component that maps the "type" to an icon and a message.
*/