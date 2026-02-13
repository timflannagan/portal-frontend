import { useState } from "react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { env } from "@/config/env";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TokenInput } from "@/components/auth/token-input";
import { ChevronDown, Shield, Plug, CircleDot, LogIn, LogOut } from "lucide-react";

interface NavItemProps {
  to: string;
  label: string;
}

function NavItem({ to, label }: NavItemProps) {
  const matchRoute = useMatchRoute();
  const isActive = matchRoute({ to, fuzzy: true });

  return (
    <Link
      to={to}
      className={[
        "relative px-3 py-1.5 text-sm transition-colors",
        isActive
          ? "text-foreground font-medium"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-3 right-3 h-px bg-foreground" />
      )}
    </Link>
  );
}

export function Header() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const [showTokenInput, setShowTokenInput] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto max-w-7xl flex h-14 items-center px-6 gap-6">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <CircleDot className="h-5 w-5 text-primary" />
            <span className="font-semibold tracking-tight text-sm">
              {env.companyName}
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 ml-6">
            <NavItem to="/apis" label="APIs" />
            {isAuthenticated && (
              <>
                <NavItem to="/teams" label="Teams" />
                <NavItem to="/apps" label="Apps" />
              </>
            )}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Admin */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <Shield className="h-3.5 w-3.5" />
                  Admin
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin/subscriptions">Subscriptions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/apps">Applications</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/teams">Teams</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User */}
          {isAuthenticated ? (
            env.oidcEnabled ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="max-w-[120px] truncate">
                      {user?.username ?? user?.email ?? "Connected"}
                    </span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user && (
                    <>
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        {user.email ?? user.username}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTokenInput(true)}
                className="gap-2 text-sm"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="max-w-[120px] truncate">
                  {user?.username ?? user?.email ?? "Connected"}
                </span>
              </Button>
            )
          ) : (
            env.oidcEnabled ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => login()}
                className="gap-2 text-sm"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTokenInput(true)}
                className="gap-2 text-sm"
              >
                <Plug className="h-3.5 w-3.5" />
                Connect
              </Button>
            )
          )}
        </div>
      </header>

      {!env.oidcEnabled && (
        <TokenInput open={showTokenInput} onOpenChange={setShowTokenInput} />
      )}
    </>
  );
}
