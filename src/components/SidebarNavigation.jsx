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
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom";

const navItems = [
  {
    icon: Home,
    label: "Home",
    href: "/",
    description: "Your main feed"
  },
  {
    icon: Users,
    label: "Communities",
    href: "/communities",
    description: "Join local groups"
  },
  {
    icon: Compass,
    label: "Explore",
    href: "/explore",
    description: "Discover new content"
  },
  {
    icon: Calendar,
    label: "Events",
    href: "/events",
    description: "Find local events"
  },
  {
    icon: Radio,
    label: "Broadcasting",
    href: "/broadcasting",
    description: "Live streams"
  },
  {
    icon: Video,
    label: "Videos",
    href: "/videos",
    description: "Watch videos"
  },
  {
    icon: BarChart3,
    label: "Polls",
    href: "/polls",
    description: "Vote and create polls"
  },
  {
    icon: Store,
    label: "Local Businesses",
    href: "/businesses",
    description: "Support local shops"
  },
  {
    icon: MessageCircle,
    label: "Messages",
    href: "/messages",
    description: "Direct messages"
  },
  {
    icon: MessageSquare,
    label: "Chats",
    href: "/chats",
    description: "Group conversations"
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
    description: "Stay updated"
  },
  {
    icon: Bookmark,
    label: "Bookmarks",
    href: "/bookmarks",
    description: "Saved content"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    description: "Account preferences"
  },
]
/** Desktop sidebar with links to different views in the app. */
const SidebarNavigation = ({ onItemClick, onCreatePost }) => {
  //const intl = useIntl();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="sticky top-6 h-fit">
      <div className="rounded-lg border bg-card p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.label} to={item.href} onClick={onItemClick}>
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                      }`} hidden>
                        {item.description}
                      </div>
                    </div>
                  </button>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
            <Button className="w-full gap-2 mb-2" size="lg" onClick={onCreatePost}>
              <Plus className="h-5 w-5" />
              Create Post
            </Button>
            <button
              onClick={onItemClick}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Sign out</div>
                <div className="text-xs mt-0.5 text-muted-foreground">
                  Leave your account
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
