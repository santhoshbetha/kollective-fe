/*
  ##Follow Organization" feature, so users can subscribe to an entire newspaper or group
  #and see all their multi-district posts in one unified feed

  4. React UI: Follow Button & Feed Card
In your React app, when a post is from an organization, the "Follow" button should target the
Organization ID, not the individual author.
*/


const handleFollowOrg = async (orgId) => {
  await fetch(`/api/organizations/${orgId}/follow`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  setIsFollowing(true);
};

/*
5. Why this is a Discovery Powerhouse

    Topic Subscriptions: A user can follow a specific "Texas Legal News" organization to see every update they post to any district in the state.
    Institutional Trust: Users often trust a verified newspaper more than a random "Scholar." Following the org ensures they never miss a professional report.
    Unified Voice: Even if 10 different journalists from one newspaper post to 10 different districts, the follower sees them all in one clean stream.
*/
