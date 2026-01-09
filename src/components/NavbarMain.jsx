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
            <Link to="/about" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-lg font-bold text-primary-foreground">K</span>
                </div>
                <span className="hidden text-xl font-bold sm:inline-block title-custom text-primary" style={{ fontSize: "28px" }}>
                    Kollective<span className="text-[#1D9BF0]">99</span>
                </span>
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