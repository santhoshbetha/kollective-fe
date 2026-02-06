import { useState } from "react";

// src/features/event/hooks/useEvents.js
export const useEvents = (eventId = null) => {
  const [data, setData] = useState(eventId ? null : []);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    // Endpoint switches based on whether you want one event or the list
    const endpoint = eventId ? `/api/v1/events/${eventId}` : '/api/v1/events';
    const res = await api.get(endpoint);
    setData(res.data);
    setLoading(false);
  };

  return { data, loading, reload: fetch };
};
