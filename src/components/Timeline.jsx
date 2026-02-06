// src/components/Timeline.js
import React from 'react';
import { Stack, Spinner } from 'soapbox-ui';
import Status from './Status'; // Your single Status component

/*
2. The Generic Timeline Component
This component doesn't care if it's in a Group or on the Home page. 
It only cares about rendering a list of statuses.
*/

export const Timeline = ({ items, isLoading, onLoadMore }) => {
  if (isLoading && items.length === 0) return <Spinner />;

  return (
    <Stack spacing={0} divider>
      {items.map(status => (
        <Status key={status.id} status={status} />
      ))}
      <button onClick={onLoadMore} className="load-more-btn">
        Load More
      </button>
    </Stack>
  );
};
