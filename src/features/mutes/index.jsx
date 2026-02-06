/*
 update your useTimeline hook to include a "setItems" export so you can easily handle the 
 list filtering shown above

 above means below code from "scheduled-statuses/index.jsx"

 const handleRemove = (id) => {
  setItems(prev => prev.filter(item => item.id !== id));
};

To finalize the useTimeline hook, we will add the setItems export. This is the "secret sauce" for the 
reduction—it allows parent components to instantly remove or update items (like a cancelled scheduled 
post or a blocked user) without needing a heavy Redux dispatch or a full API re-fetch.

2. Applying this to mutes and blocks
These two features are almost identical. You can now delete the entire mutes and blocks folders and replace them 
with a single generic list view.
*/
import React from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { EntityCard } from '@/components/EntityCard';
import { API_ENDPOINTS } from '@/constants/endpoints';

const MutesPage = () => {
  const { items, setItems, isLoading } =  useTimeline(API_ENDPOINTS.MUTES);;//useTimeline('/api/v1/mutes');

  const handleUnmute = (id) => {
    // Instant UI update: remove the user from the list
    setItems(prev => prev.filter(user => user.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Muted Users</h1>
      {items.map(user => (
        <EntityCard
            entity={user}  
            action={
            <button onClick={() => handleUnmute(user.id)}>
                Unmute
            </button>
            }
        />
      ))}
    </div>
  );
};

export default MutesPage;

/*
Summary of Reductions
By exporting setItems, you've enabled:

    Scheduled Statuses: Instant removal upon "Cancel."
    Mutes/Blocks: Instant removal upon "Unmute/Unblock."
    Notifications: Instant removal upon "Dismiss."
    Home Feed: Instant removal if you "Block" a user from their post.
*/

/*
Why this works :

    1. Prop Pass-through: The action prop takes the entire <button> element.
       This keeps the EntityCard component generic so it doesn't need to know what "Unmute" does.
    2. State Control: By using setItems from our reduced useTimeline hook, the user 
       disappears from the list immediately upon clicking, providing a snappy Soapbox 3.0 experience.
    3. Modular Design: You can copy-paste this exact file for src/features/blocks/index.jsx, 
       simply changing the endpoint to /api/v1/blocks and the button text to "Unblock."
*/
