import { Socket } from "phoenix";

//## Real-time Updates so new posts appear in these tabs without the user having to refresh their browser

/*
In React, use the Phoenix JS library to connect to the channel 
and listen for the "new_post" event.
*/
/*
Why this is essential for Discovery

    Instant Feed: Users see "Voice" posts and "Town Hall" responses the millisecond they are published.
    Engagement Boost: Real-time updates encourage immediate upvoting, which extends the expires_at timer in real-time.
    Efficiency: Instead of React "polling" the API every 30 seconds (which wastes battery and bandwidth), the server only sends data when there is actually a new post. 

Summary of the Final Real-time Stack

    Backend: Phoenix PubSub handles the distribution of messages across your server cluster.
    Transport: WebSockets provide a persistent, two-way connection between Elixir and React.
    Frontend: React Hooks manage the socket connection and update the UI state dynamically
*/

const useDiscoveryChannel = (tabName, userDistricts) => {
  useEffect(() => {
    const socket = new Socket("/socket", { params: { token: localStorage.getItem("token") } });
    socket.connect();

    // Construct the topic based on user's current tab and district
    const topic = `discovery:${tabName}:${userDistricts.state}:${userDistricts.federal}`;
    const channel = socket.channel(topic);

    channel.join()
      .receive("ok", () => console.log("Joined discovery channel"))
      .receive("error", resp => console.log("Unable to join", resp));

    channel.on("new_post", (payload) => {
      // Add the new post to the top of your React state list
      setPosts(prevPosts => [payload.post, ...prevPosts]);
    });

    return () => channel.leave();
  }, [tabName]);
};


/*
 "Presence" logic so users can see how many other "Neighbors" 
 are currently active in their Local tab
*/
/*
Handle Presence in React
In your React frontend, use the Presence 
class from the phoenix library to sync the real-time join/leave events.
*/
/*
 Why Presence is Powerful for Local Discovery

    Zero Latency Community: Users instantly see a badge like "12 Neighbors Active Now".
    Privacy-First: You only track unique IDs per district topic. You don't need a central database to count "online" users; it's handled in memory across your server cluster.
    Real-time Feedback: When a "Voice" post goes viral locally, users will see the "Neighbor Count" spike as more people join the channel to engage.
*/
import { Presence } from "phoenix";

// Inside your useDiscoveryChannel hook
const [neighborCount, setNeighborCount] = useState(0);

useEffect(() => {
  let presence = new Presence(channel);

  // Sync state and diffs automatically
  presence.onSync(() => {
    // Count unique user IDs present in this district
    const count = Object.keys(presence.state).length;
    setNeighborCount(count);
  });

  // socket.connect() and channel.join() logic...
}, [tabName]);
