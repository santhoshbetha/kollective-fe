import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const TimeAgo = ({ date }) => {
  const [timeStr, setTimeStr] = useState(() => 
    formatDistanceToNow(new Date(date), { addSuffix: true })
  );

  useEffect(() => {
    // Update the string every 60 seconds
    const interval = setInterval(() => {
      setTimeStr(formatDistanceToNow(new Date(date), { addSuffix: true }));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return <span title={new Date(date).toLocaleString()}>{timeStr}</span>;
};

export default TimeAgo;
