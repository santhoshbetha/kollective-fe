/*

*/
const [posts, setPosts] = useState([]);
const [activeTab, setActiveTab] = useState('local');

const loadInitialTab = async (tabName) => {
  setPosts([]); // Clear current feed
  const { data } = await axios.get(`/api/discovery/feed?tab=${tabName}`);
  setPosts(data.data);
  setNextMaxTs(data.meta.next_max_ts);
};

useEffect(() => {
  loadInitialTab('local'); // Initial load on mount
}, []);

/*
React app simply tracks the activeTab and calls the same GET method with the tab name.
*/
const loadFeed = async (tabName, isLoadMore = false) => {
  const tsParam = isLoadMore ? `&max_ts=${nextMaxTs}` : "";
  const url = `/api/discovery/feed?tab=${tabName}${tsParam}`;
  
  const { data } = await axios.get(url);
  
  if (isLoadMore) {
    setPosts(prev => [...prev, ...data.data]);
  } else {
    setPosts(data.data); // Initial load: clear old posts
  }
  setNextMaxTs(data.meta.next_max_ts);
};

/*
In your React app, whenever the user clicks a tab, you leave the old channel and join the new one.
*/
// Inside your Feed Component
const [newPostsBuffer, setNewPostsBuffer] = useState([]);

useEffect(() => {
  const socket = new Socket("/socket", { params: { token: window.userToken } });
  socket.connect();

  // Join the channel for the active tab (e.g., "discovery:local")
  const channel = socket.channel(`discovery:${activeTab}`, {});
  channel.join();

  channel.on("new_post_available", (payload) => {
    // Show the "Show X new posts" badge
    setNewPostsBuffer(prev => [payload.post, ...prev]);
  });

  return () => channel.leave();
}, [activeTab]); // RE-RUNS when the tab changes!


//==================================================
//Event Cancellation listener
channel.on("event_deleted", ({ event_id }) => {
  // Instantly remove the event card from the local discovery map/list
  setEvents(prev => prev.filter(e => e.id !== event_id));
});


//==================================
/*
"Event Kill Switch"
 React Frontend (The "Vanishing" Act)
Update your Local Tab component to listen for the scrub event and remove the gathering from the map/list instantly.
*/
channel.on("remove_event_card", ({ id }) => {
  setEvents(prev => prev.filter(e => e.id !== id));
  toast.warning("A nearby event was cancelled by moderators for safety.");
});
/*
Why this is "Safety-Critical" Design:

    District Locking: By broadcasting the district ID, you ensure that the channel only pushes the "Scrub" event to users physically relevant to that area, reducing unnecessary data for others.
    Atomic Cleanup: If the event deletion fails in the Multi, the broadcast is never triggered, preventing "False Positives" where an event looks cancelled but still exists in the DB.
    Authoritative: The actor_id in the notification identifies the action as a moderator decision, distinguishing it from an organizer-led cancellation.
*/

//=====================================================================
/*
