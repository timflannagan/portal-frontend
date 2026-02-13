import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Unplug, Plug, Terminal } from "lucide-react";

interface TokenInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenInput({ open, onOpenChange }: TokenInputProps) {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!token.trim()) return;
    setConnecting(true);
    try {
      await login(token.trim());
      setToken("");
      onOpenChange(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    logout();
    setToken("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-sm tracking-wide uppercase">
            <Terminal className="h-4 w-4" />
            API Connection
          </DialogTitle>
          <DialogDescription>
            {isAuthenticated
              ? `Connected as ${user?.username ?? user?.email ?? "unknown"}`
              : "Paste a Bearer token to authenticate with the portal API."}
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 border border-dashed p-4">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground font-mono text-xs">user</span>
                <span className="font-medium truncate">{user?.username ?? "—"}</span>
                <span className="text-muted-foreground font-mono text-xs">email</span>
                <span className="truncate">{user?.email ?? "—"}</span>
                <span className="text-muted-foreground font-mono text-xs">role</span>
                <span>{user?.isAdmin === "true" ? "Admin" : "Member"}</span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="w-full gap-2"
              >
                <Unplug className="h-3.5 w-3.5" />
                Disconnect
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="eyJhbGciOiJSUzI1NiIs..."
              className="font-mono text-xs min-h-[120px] resize-none"
              autoFocus
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleConnect}
                disabled={!token.trim() || connecting}
                className="gap-2"
              >
                <Plug className="h-3.5 w-3.5" />
                {connecting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
