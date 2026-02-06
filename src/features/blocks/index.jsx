import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { EntityCard } from '@/components/EntityCard';
import { API_ENDPOINTS } from '@/constants/endpoints';
import api from '@/api';

const BlocksPage = () => {
  // Use the central constant for /api/v1/blocks
  const { items, setItems, isLoading } = useTimeline(API_ENDPOINTS.BLOCKS);

  const handleUnblock = async (id) => {
    try {
      await api.post(`/api/v1/accounts/${id}/unblock`);
      // Instant UI update: remove the user from the list
      setItems(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error("Unblock failed:", err);
    }
  };

  if (isLoading && items.length === 0) return <div>Loading blocks...</div>;

  return (
    <div className="blocks-view p-4">
      <h1 className="text-xl font-bold mb-4">Blocked Users</h1>
      
      {items.length === 0 && <p className="text-gray-500">You haven't blocked anyone yet.</p>}

      <div className="flex flex-col gap-2">
        {items.map(user => (
        <EntityCard
            entity={user}  
            action={
            <button onClick={() => handleUnblock(user.id)} className="text-blue-500 text-xs">
                 Unblock
            </button>
            }
        />
        ))}
      </div>
    </div>
  );
};

export default BlocksPage;

/*
2. Why this is the "Reduced" Winner

    1. Identical Patterns: It reuses the exact same EntityCard identity 
       logic used in Search and Groups, ensuring a consistent Soapbox 3.0 look.
    2. Deleted Files: You can now delete src/features/blocks/components/Block.js, BlockList.js, 
       and any specialized UnblockButton.js.
    3. Lower Maintenance: If you improve the EntityCard (e.g., adding hover states), the Blocks page gets 
       those updates automatically.
*/


