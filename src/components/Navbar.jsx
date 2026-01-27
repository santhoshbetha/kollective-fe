import { useState } from "react";
import { Search, Bell, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = ({ onMenuClick, isMobileNavOpen }) => {
    const [showLoginModal, setShowLoginModal] = useState(false);

    return (
      <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto xl:mx-0 flex h-16 max-w-7xl xl:max-w-none items-center justify-between gap-4 px-4 xl:px-6 xl:pl-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link to="/">
              <div className="flex items-center gap-0">
                <img src="/K99G2.png" alt="Kollective99 Logo" className="h-12 w-14" />
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold cursor-pointer bg-linear-to-r from-[#E2023F] via-orange-500 to-yellow-500 bg-clip-text text-transparent" style={{ fontSize: "28px", fontFamily: "Protest Riot, sans-serif" }}>
                    Kollective99
                  </h1>
                  <p className="text-xs text-muted-foreground -mt-1" style={{ fontFamily: "Protest Riot, sans-serif" }}>
                    for the people, of the people
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 max-w-xl lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Search communities, posts, users..." className="w-full pl-10 h-10" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/about">About</Link>
            </Button>

            <ThemeToggle />
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Bell className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild>
              <Link to="/profile/edit">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>
      </>
    );
}
export default Navbar;