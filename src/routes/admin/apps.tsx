import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTeams } from "@/api/queries/teams";
import { useAllApps } from "@/api/queries/apps";
import { useUpsertAppMetadata } from "@/api/mutations/apps";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppWindow, Settings } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { RATE_LIMIT_UNITS } from "@/api/types";

export const Route = createFileRoute("/admin/apps")({
  component: () => (
    <AuthGuard>
      <AdminAppsPage />
    </AuthGuard>
  ),
});

function AdminAppsPage() {
  const { data: teams } = useTeams();
  const { apps, isLoading } = useAllApps(teams);
  const [editAppId, setEditAppId] = useState<string | null>(null);

  const editApp = apps.find((a) => a.id === editAppId);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Application Management" description="Manage app metadata and rate limits." />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Application Management"
        description="Manage app metadata and rate limits."
      />

      {!apps.length ? (
        <EmptyState
          icon={AppWindow}
          title="No applications"
          description="No applications have been created yet."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Rate Limit</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => {
              const team = teams?.find((t) => t.id === app.teamId);
              return (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell className="text-muted-foreground">{team?.name ?? app.teamId}</TableCell>
                  <TableCell>
                    {app.metadata ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {app.metadata.rateLimit.requestsPerUnit}/{app.metadata.rateLimit.unit}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(app.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditAppId(app.id)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {editApp && (
        <MetadataDialog
          appId={editApp.id}
          appName={editApp.name}
          currentRateLimit={editApp.metadata?.rateLimit}
          open={!!editAppId}
          onOpenChange={(open) => !open && setEditAppId(null)}
        />
      )}
    </div>
  );
}

function MetadataDialog({
  appId,
  appName,
  currentRateLimit,
  open,
  onOpenChange,
}: {
  appId: string;
  appName: string;
  currentRateLimit?: { requestsPerUnit: string; unit: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const upsert = useUpsertAppMetadata();
  const [requestsPerUnit, setRequestsPerUnit] = useState(currentRateLimit?.requestsPerUnit ?? "100");
  const [unit, setUnit] = useState(currentRateLimit?.unit ?? "MINUTE");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsert.mutateAsync({ appId, rateLimit: { requestsPerUnit, unit } });
      toast.success("Metadata updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Metadata: {appName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Requests Per Unit</Label>
            <Input
              type="number"
              value={requestsPerUnit}
              onChange={(e) => setRequestsPerUnit(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATE_LIMIT_UNITS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
