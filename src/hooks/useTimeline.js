// src/hooks/useTimeline.js
import { useState, useEffect } from 'react';
import api from '../api';

//Timelne/Feed component reduction from soapbox

export const useTimeline = (endpoint, params = {}) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = async (isMore = false) => {
    const lastId = isMore && items.length > 0 ? items[items.length - 1].id : null;
    const response = await api.get(endpoint, { 
      params: { ...params, max_id: lastId } 
    });
    
    setItems(prev => isMore ? [...prev, ...response.data] : response.data);
    setIsLoading(false);
  };

  useEffect(() => { fetchTimeline(); }, [endpoint]);

  return { items, isLoading, loadMore: () => fetchTimeline(true) };
};

//========================================================================
/*
To ensure the
useTimeline hook can handle the /api/v1/scheduled_statuses endpoint (and others like it), we need to make it
 generic enough to handle different JSON structures.

While standard timelines return a list of Statuses, the scheduled endpoint returns Scheduled Statuses, 
which have a slightly different data shape (the actual status content is nested inside a params object).
The Generic useTimeline.js Hook

Place this in src/hooks/useTimeline.js.
*/
import { useState, useEffect, useCallback } from 'react';
import api from '@/api';

export const useTimeline = (endpoint) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async (isMore = false) => {
    setIsLoading(true);
    
    // Get the ID of the last item for pagination (max_id)
    const lastId = isMore && items.length > 0 ? items[items.length - 1].id : null;

    try {
      const response = await api.get(endpoint, {
        params: { max_id: lastId, limit: 20 }
      });

      setItems(prev => isMore ? [...prev, ...response.data] : response.data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error(`Failed to fetch timeline from ${endpoint}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, items]);

  // Initial load
  useEffect(() => {
    fetchTimeline();
  }, [endpoint]); // Only re-run if the endpoint changes

  return {
    items,
    isLoading,
    error,
    loadMore: () => fetchTimeline(true),
    refresh: () => fetchTimeline(false)
  };
};

//================================================================================================
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

1. The Final useTimeline.js Hook
*/
// src/hooks/useTimeline.js
import { useState, useEffect, useCallback } from 'react';
import api from '@/api';

export const useTimeline = (endpoint) => {
  const [items, setItems] = useState([]); // Exporting this is key
  const [isLoading, setIsLoading] = useState(true);

  const fetchTimeline = useCallback(async (isMore = false) => {
    setIsLoading(true);
    const lastId = isMore && items.length > 0 ? items[items.length - 1].id : null;

    try {
      const response = await api.get(endpoint, {
        params: { max_id: lastId, limit: 20 }
      });

      setItems(prev => isMore ? [...prev, ...response.data] : response.data);
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, items]);

  useEffect(() => {
    fetchTimeline();
  }, [endpoint]);

  return { items, setItems, isLoading, loadMore: () => fetchTimeline(true) };
};


