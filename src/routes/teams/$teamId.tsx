import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTeam, useTeamMembers } from "@/api/queries/teams";
import { useDeleteTeam, useAddTeamMember, useRemoveTeamMember } from "@/api/mutations/teams";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/teams/$teamId")({
  component: () => (
    <AuthGuard>
      <TeamDetailPage />
    </AuthGuard>
  ),
});

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(teamId);
  const { data: members, isLoading: loadingMembers } = useTeamMembers(teamId);
  const deleteTeam = useDeleteTeam();
  const removeMember = useRemoveTeamMember();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!team) {
    return (
      <EmptyState
        icon={Users}
        title="Team not found"
        description="This team does not exist or you don't have access."
      />
    );
  }

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam.mutateAsync(teamId);
      toast.success("Team deleted");
      navigate({ to: "/teams" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete team");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    try {
      await removeMember.mutateAsync({ teamId, memberId: memberToRemove });
      toast.success("Member removed");
      setMemberToRemove(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teams" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Teams
        </Link>
        <span>/</span>
        <span className="text-foreground">{team.name}</span>
      </div>

      <PageHeader
        title={team.name}
        description={team.description || undefined}
        actions={
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteTeam(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Members</CardTitle>
          <Button size="sm" onClick={() => setShowAddMember(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {loadingMembers ? (
            <TableSkeleton rows={3} />
          ) : !members?.length ? (
            <EmptyState
              icon={Users}
              title="No members"
              description="Add members to this team."
              action={
                <Button size="sm" onClick={() => setShowAddMember(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Member
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name || member.username}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.synced ? "secondary" : "outline"}>
                        {member.synced ? "Active" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setMemberToRemove(member.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddMemberDialog teamId={teamId} open={showAddMember} onOpenChange={setShowAddMember} />

      <ConfirmDialog
        open={showDeleteTeam}
        onOpenChange={setShowDeleteTeam}
        title="Delete team"
        description={`Are you sure you want to delete "${team.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteTeam.isPending}
        onConfirm={handleDeleteTeam}
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove member"
        description="Are you sure you want to remove this member from the team?"
        confirmLabel="Remove"
        variant="destructive"
        loading={removeMember.isPending}
        onConfirm={handleRemoveMember}
      />
    </div>
  );
}

function AddMemberDialog({
  teamId,
  open,
  onOpenChange,
}: {
  teamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addMember = useAddTeamMember();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMember.mutateAsync({ teamId, email });
      toast.success("Member added");
      setEmail("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!email.trim() || addMember.isPending}>
              {addMember.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
