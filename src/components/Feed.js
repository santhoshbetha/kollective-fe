// React: Feed.js
const fetchFeed = async (tabName) => {
  // tabName: 'local', 'state', 'country', 'world'
  const res = await fetch(`/api/discovery/feed?tab=${tabName}`);
  const json = await res.json();
  setPosts(json.data);
};

const loadTabFeed = async (selectedTab) => {
  // selectedTab is "local", "state", "country", or "world"
  const token = localStorage.getItem('user_token');
  
  const response = await fetch(`/api/discovery/feed?tab=${selectedTab}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const json = await response.json();
  setPosts(json.data);
};

/*
Since we previously set up Cursor-based pagination, ensure your controller passes the 
params (which include your after cursor) into the context functions. This allows your 
React app to infinitely scroll within each specific tab (e.g., scrolling through 
the "State" tab without accidentally seeing "Local" posts).
*/