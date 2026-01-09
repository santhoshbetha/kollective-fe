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
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
              {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link to="/">
              <div className="flex items-center gap-0">
                <img src="/K99.png" alt="Kollective99 Logo" className="h-12 w-14" />
                <h1 className="text-xl font-bold text-primary cursor-pointer title-custom" style={{ fontSize: "28px" }}>
                  Kollective<span className="text-[#1D9BF0]">99</span>
                </h1>
              </div>
            </Link>
          </div>

          <div className="hidden flex-1 max-w-md lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input type="search" placeholder="Search communities, posts, users..." className="w-full pl-10" />
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

            <Button variant="ghost" size="icon" onClick={() => setShowLoginModal(true)}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      </>
    );
}
export default Navbar;