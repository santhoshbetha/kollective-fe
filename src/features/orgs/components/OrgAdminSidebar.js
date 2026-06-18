/*
 #Live Notification that triggers a red badge for Org Admins when a journalist requests
  # to join their group, you will leverage Phoenix Channels to push real-time updates.
  
3. React Frontend: Live Badge Listener
In your React app, connect to the channel and update a "Red Badge" state 
when the new_join_request event is received.
*/
// React: OrgAdminSidebar.js
import { Socket } from "phoenix";

const OrgAdminSidebar = ({ orgId, token }) => {
  const [unreadRequests, setUnreadRequests] = useState(0);

  useEffect(() => {
    const socket = new Socket("/socket", { params: { token } });
    socket.connect();

    const channel = socket.channel(`org_admin:${orgId}`);
    channel.join();

    // 3. Listen for the real-time event
    channel.on("new_join_request", (payload) => {
      // Increment the red badge count
      setUnreadRequests(prev => prev + 1);
      
      // Optional: Browser notification
      new Notification(`New request from @${payload.user_nickname}`);
    });

    return () => channel.leave();
  }, [orgId]);

  return (
    <div className="relative">
      <UsersIcon className="h-6 w-6 text-gray-600" />
      {unreadRequests > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
          {unreadRequests}
        </span>
      )}
    </div>
  );
};

/*
4. Implementation Details

    Security: Always verify the current_user inside the join/3 callback of the channel to prevent non-admins from "snooping" on join requests.
    Presence: You can combine this with Phoenix Presence to show a status like "3 Admins Currently Online" in the organization dashboard.
    State Management: When the admin clicks the "Pending Requests" tab and views the list, your React app should send a message to the channel or call your mark_all_read API to reset the unreadRequests counter to zero. 
*/

/*
Why this is a Discovery Powerhouse:

    Immediate Onboarding: Journalists can be approved and start posting to the State and Country feeds within seconds of their request.
    Administrative Urgency: The "Red Badge" provides a visual cue that the organization's member list needs attention.
    Unified Experience: Real-time updates make the platform feel alive and responsive, encouraging faster collaboration between news groups and individual contributors.
*/
