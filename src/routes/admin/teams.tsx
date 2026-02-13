import { createFileRoute, Link } from "@tanstack/react-router";
import { useTeams } from "@/api/queries/teams";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/admin/teams")({
  component: () => (
    <AuthGuard>
      <AdminTeamsPage />
    </AuthGuard>
  ),
});

function AdminTeamsPage() {
  const { data: teams, isLoading } = useTeams();

  return (
    <div>
      <PageHeader
        title="Team Management"
        description="View and manage all teams."
      />

      {isLoading ? (
        <TableSkeleton />
      ) : !teams?.length ? (
        <EmptyState
          icon={Users}
          title="No teams"
          description="No teams have been created yet."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {team.description || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(team.createdAt)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link to="/teams/$teamId" params={{ teamId: team.id }}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
