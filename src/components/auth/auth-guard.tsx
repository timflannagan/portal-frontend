import { useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { env } from "@/config/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TokenInput } from "./token-input";
import { Lock, ArrowRight, LogIn } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoadingUser, login } = useAuth();
  const [showTokenInput, setShowTokenInput] = useState(false);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-sm border-dashed">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto rounded-full bg-muted p-3 mb-3 w-fit">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">Authentication Required</CardTitle>
              <CardDescription>
                {env.oidcEnabled
                  ? "Sign in to access this section."
                  : "Connect with a Bearer token to access this section."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {env.oidcEnabled ? (
                <Button onClick={() => login()} className="w-full gap-2">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in
                </Button>
              ) : (
                <Button
                  onClick={() => setShowTokenInput(true)}
                  className="w-full gap-2"
                >
                  Connect
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        {!env.oidcEnabled && (
          <TokenInput open={showTokenInput} onOpenChange={setShowTokenInput} />
        )}
      </>
    );
  }

  return <>{children}</>;
}
