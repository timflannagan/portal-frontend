import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTeams } from "@/api/queries/teams";
import { useAllApps } from "@/api/queries/apps";
import { useCreateApp } from "@/api/mutations/apps";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardGridSkeleton } from "@/components/common/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, AppWindow, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/apps/")({
  component: () => (
    <AuthGuard>
      <AppsPage />
    </AuthGuard>
  ),
});

function AppsPage() {
  const { data: teams } = useTeams();
  const { apps, isLoading } = useAllApps(teams);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = apps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Applications"
        description="Manage your applications and their credentials."
        actions={
          teams?.length ? (
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New App
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : !filtered.length ? (
        <EmptyState
          icon={AppWindow}
          title="No applications found"
          description={
            search
              ? "Try adjusting your search."
              : "Create an application to get started with API keys and subscriptions."
          }
          action={
            !search && teams?.length ? (
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create App
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((app) => (
            <Link
              key={app.id}
              to="/apps/$appId"
              params={{ appId: app.id }}
              className="block group"
            >
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{app.name}</CardTitle>
                    {app.metadata && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        {app.metadata.rateLimit.requestsPerUnit}/{app.metadata.rateLimit.unit}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {app.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Created {formatDate(app.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {teams && (
        <CreateAppDialog teams={teams} open={showCreate} onOpenChange={setShowCreate} />
      )}
    </div>
  );
}

function CreateAppDialog({
  teams,
  open,
  onOpenChange,
}: {
  teams: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createApp = useCreateApp();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApp.mutateAsync({ teamId, name, description });
      toast.success("Application created");
      setName("");
      setDescription("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create app");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Team</Label>
            <Select value={teamId} onValueChange={setTeamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-name">Name</Label>
            <Input
              id="app-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Application"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-desc">Description</Label>
            <Textarea
              id="app-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || !teamId || createApp.isPending}>
              {createApp.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
