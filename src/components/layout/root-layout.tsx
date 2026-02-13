import { Outlet } from "@tanstack/react-router";
import { Header } from "./header";
import { ErrorBoundary } from "@/components/common/error-boundary";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
