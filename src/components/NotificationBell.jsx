/*
/*React FE handling of Elixir BE notifications (do using google AI suggestions)

To catch those Elixir/Phoenix broadcasts in a React frontend, we’ll use the official phoenix JS library.
This setup uses Tailwind CSS for layout and Shadcn/UI for the notification "Toast" and Popover.

2. The Header Component (Shadcn + Tailwind)
We'll use the Shadcn Popover to show a dropdown list of recent notifications.
*/
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell({ user }) {
  const { notifications } = useNotifications(user.id, user.token);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-semibold border-b">Notifications</div>
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No new pings</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border-b hover:bg-slate-50 transition-colors">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {n.actor_name[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">
                    <span className="font-bold">{n.actor_name}</span> {getVerb(n.type)}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

const getVerb = (type) => {
  if (type === "like") return "liked your post";
  if (type === "mention") return "mentioned you";
  return "interacted with you";
};

export default NotificationBell;

/*
3. Implementation Details

    1.The Dot: The red badge uses Tailwind's absolute positioning to sit on top of the bell icon.
    2.The List: We use Shadcn Scroll Area so that if a user gets 50 mentions, the UI doesn't break.
    3.Real-time: Because of the useEffect in the hook, as soon as your Elixir CommonAPI.post hits 
      the broadcast line, the UI updates instantly without any API polling.
*/

/*
To make this work:

    Install the socket library: npm install phoenix.
    Make sure your Elixir UserSocket or channel validates the userToken (usually 
    via Guardian or Phoenix.Token).
*/

/*
TODO LATER: ONCE LOGIN IMPLEMENTED:

Connection from Frontend (Recap)
On your React side, you just need to pass the token you got during login:

javascript:
const socket = new Socket("/socket", { params: { token: "YOUR_SIGNED_TOKEN" } });
socket.connect();
const channel = socket.channel(`user_feed:${currentUser.id}`, {});

*/