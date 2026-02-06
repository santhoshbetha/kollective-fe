import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useTimeline } from '../../hooks/useTimeline';
import { useGroups } from './hooks/useGroups';
import { Timeline } from '../../components/Timeline';
import { EntityCard } from '../../components/EntityCard';

/*
The current
GroupPage component streamlines the original Soapbox group feature, which was spread across files 
like Group.js (for Redux state and API calls), 
GroupHeader.js (for dedicated group header logic),
 TimelineContainer.js (for specific feature feed logic), 
 and JoinButton.js (for join/leave buttons). 
 The GroupPage component replaces these with generic hooks and reusable components,
 reducing code size and complexity. For more details
*/

const GroupPage = () => {
  const { id } = useParams();
  
  const { data: group, loading: groupLoading, reload } = useGroups(id);
  const { items, isLoading: timelineLoading, loadMore } = useTimeline(`/api/v1/groups/${id}/statuses`);

  useEffect(() => {
    if (id) reload();
  }, [id]);

  if (groupLoading || !group) {
    return <div>Loading Group...</div>;
  }

  return (
    <div className="group-feature-container">
        <EntityCard
            entity={group}  
            action={
            <button onClick={() => console.log('Action for:', id)}>
                {group.is_member ? 'Leave Group' : 'Join Group'}
            </button>
            }
        />

        <div className="timeline-section" style={{ marginTop: '20px' }}>
            <Timeline 
                items={items} 
                isLoading={timelineLoading} 
                onLoadMore={loadMore} 
            />
        </div>
    </div>
  );
};

export default GroupPage;
