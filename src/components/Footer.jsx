import { Link } from "react-router-dom"
export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Footer Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/support" className="text-muted-foreground hover:text-foreground transition-colors">
              Support
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Kollective99. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}