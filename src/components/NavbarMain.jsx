import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";

const NavbarMain = ({  }) => {

    return (
      <>
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            {/* Logo */}
            <Link to="/about" className="flex items-center gap-0">
                <img src="/K99.png" alt="Kollective99 Logo" className="h-12 w-14" />
                <div className="flex flex-col">
                    <span className="hidden text-xl font-bold sm:inline-block bg-linear-to-r from-red-700 via-purple-700 to-red-900 bg-clip-text text-transparent" style={{ fontSize: "28px", fontFamily: "Protest Riot, sans-serif" }}>
                        Kollective99
                    </span>
                    <p className="hidden text-xs text-muted-foreground sm:inline-block -mt-1" style={{ fontFamily: "Protest Riot, sans-serif" }}>
                        for the people, of the people
                    </p>
                </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
            <Link to="/">
                <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
                </Button>
            </Link>
            <Link to="/login">
                <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/signup">
                <Button variant="default">Register</Button>
            </Link>
            <ThemeToggle />
            </div>
        </div>
        </header>
      </>
    );
}
export default NavbarMain;

/*
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
    <span className="text-lg font-bold text-primary-foreground">K</span>
</div>
*/