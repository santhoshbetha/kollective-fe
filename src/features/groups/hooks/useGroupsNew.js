import { useState } from 'react';
import { fetchGroup, fetchGroups } from '../services/groups'; // Assume these are defined

//soapbox  features/groups equivalent

// src/features/groups/hooks/useGroups.js
export const useGroups = (groupId = null) => {
  const [data, setData] = useState(groupId ? null : []);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = groupId ? await fetchGroup(groupId) : await fetchGroups();
    setData(res.data);
    setLoading(false);
  };

  return { data, loading, reload: load };
};
