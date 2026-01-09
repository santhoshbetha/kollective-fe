import {
  Home,
  Compass,
  MessageCircle,
  MessageSquare,
  Bookmark,
  LogOut,
  Settings,
  Plus,
  Bell,
  Calendar,
  Radio,
  Video,
  Store,
  BarChart3,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Communities", href: "/communities" }, // Added Communities nav item
  { icon: Compass, label: "Explore", href: "/explore" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Radio, label: "Broadcasting", href: "/broadcasting" },
  { icon: Video, label: "Videos", href: "/videos" },
  { icon: BarChart3, label: "Polls", href: "/polls" },
  { icon: Store, label: "Local Businesses", href: "/businesses" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: MessageSquare, label: "Chats", href: "/chats" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks" },
  { icon: Settings, label: "Settings", href: "/settings" },
]
/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation = ({ onItemClick, onCreatePost }) => {
  //const intl = useIntl();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="sticky top-6 h-fit">
      <div className="rounded-lg border bg-card p-3">
        <Button className="w-full mb-4 gap-2" size="lg" onClick={onCreatePost}>
          <Plus className="h-5 w-5" />
          Create Post
        </Button>

        <nav className="space-y-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.label} to={item.href} onClick={onItemClick}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-foreground",
                    isActive && "bg-accent text-foreground font-medium",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}

          <div className="pt-2 mt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={onItemClick}
            >
              <LogOut className="h-5 w-5" />
              <span>Sign out</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SidebarNavigation;
