import { useState, useCallback } from 'react';
import api from '@/api';

//soapbox account component reduction:

/*
To reduce the account feature in src/features/account, 
you can consolidate the profile header, relationship actions, and moderation tools 
into a single source of truth.
In the original Soapbox, these were often split into multiple components like 
Header.js, Avatar.js, FollowButton.js, and AccountNote.js
*/

/*
1. The Logic Hook: useAccount.js
Consolidate fetching the profile and managing relationships (following, blocking, muting) into one hook.
*/

export const useAccount = (accountId) => {
  const [account, setAccount] = useState(null);
  const [relationship, setRelationship] = useState(null);

  const fetchAccount = useCallback(async () => {
    const [accRes, relRes] = await Promise.all([
      api.get(`/api/v1/accounts/${accountId}`),
      api.get(`/api/v1/accounts/relationships?id[]=${accountId}`)
    ]);
    setAccount(accRes.data);
    setRelationship(relRes.data[0]);
  }, [accountId]);

  const toggleFollow = async () => {
    const action = relationship.following ? 'unfollow' : 'follow';
    const res = await api.post(`/api/v1/accounts/${accountId}/${action}`);
    setRelationship(res.data);
  };

  return { account, relationship, fetchAccount, toggleFollow };
};

//================================================================================
/*
To add Moderation Actions, we extend the useAccount.js hook to handle the administrative 
endpoints. This allows you to delete separate "Admin Only" components and moderation modals, 
centralizing everything into the primary account lifecycle.
*/

/*
1. Extend the Logic Hook
 Add specialized admin actions like verify, warn, and deactivate.
 These follow the standard Mastodon Admin API patterns used by Soapbox.
*/

export const useAccount = (accountId) => {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Should be checked against global state

  const performAdminAction = async (action) => {
    // Endpoints for moderation
    const endpoints = {
      verify: `/api/v1/admin/accounts/${accountId}/approve`,
      warn: `/api/v1/admin/accounts/${accountId}/warn`,
      deactivate: `/api/v1/admin/accounts/${accountId}/suspend`,
    };

    try {
      const res = await api.post(endpoints[action]);
      setAccount(res.data); // Update local UI with new account status
    } catch (err) {
      console.error(`Moderation action ${action} failed:`, err);
    }
  };

  return { account, performAdminAction, isAdmin };
};




