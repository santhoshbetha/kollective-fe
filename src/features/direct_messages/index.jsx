import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { EntityCard } from '@/components/EntityCard';
import api from '@/api';

/*
The Direct Messages feature (often called "Conversations" in the API) 
can be reduced by treating the inbox as a standard timeline where each item is a conversation thread. 
By using the setItems logic we built into the useTimeline hook, you can implement a "Mark as Read" 
feature that instantly updates the UI.

1. The Reduced Entry Point
In the original Soapbox, this might be split into ConversationList, ConversationItem, 
and various status sub-components. You can consolidate these into a single feature entry point.
*/


const DirectMessagesPage = () => {
  const { items, setItems, isLoading } = useTimeline('/api/v1/conversations');

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/v1/conversations/${id}/read`);
      // Use setItems to instantly update the 'unread' badge in the UI
      setItems(prev => prev.map(conv => 
        conv.id === id ? { ...conv, unread: false } : conv
      ));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="dm-container">
      <h1 className="p-4 font-bold border-b">Messages</h1>
      {items.map(conv => (
        <EntityCard
            entity={conv}  
            action={
            <button onClick={() => markAsRead(conv.id)} className="text-blue-500 text-xs">
                 Mark Read
            </button>
            }
        />

        {/* Use children to show the last message snippet */}
        <p className={`text-sm mt-1 ${conv.unread ? 'font-bold' : 'text-gray-500'}`}>
            {conv.last_status?.content.replace(/<[^>]*>?/gm, '').substring(0, 60)}...
        </p>

      ))}
    </div>
  );
};

/*
3. The Migration Impact
Because the Mastodon API returns a last_status object inside each conversation,
your reduced Status component can even be used here to render the preview of the most recent message.

Final Cleanup: Ensure you've added CONVERSATIONS: '/api/v1/conversations' to your 
constants/endpoints.js file to keep this path clean. 
*/

