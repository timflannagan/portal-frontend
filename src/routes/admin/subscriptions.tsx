import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSubscriptionsByStatus } from "@/api/queries/subscriptions";
import { useApiProducts } from "@/api/queries/api-products";
import { useApproveSubscription, useRejectSubscription } from "@/api/mutations/subscriptions";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { TableSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Inbox } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { SubscriptionStatus } from "@/api/types";

export const Route = createFileRoute("/admin/subscriptions")({
  component: () => (
    <AuthGuard>
      <AdminSubscriptionsPage />
    </AuthGuard>
  ),
});

function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<SubscriptionStatus>("pending");

  return (
    <div>
      <PageHeader
        title="Subscription Management"
        description="Review and manage API subscription requests."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as SubscriptionStatus)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <SubscriptionTable status="pending" showActions />
        </TabsContent>
        <TabsContent value="approved">
          <SubscriptionTable status="approved" />
        </TabsContent>
        <TabsContent value="rejected">
          <SubscriptionTable status="rejected" />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubscriptionTable({
  status,
  showActions,
}: {
  status: SubscriptionStatus;
  showActions?: boolean;
}) {
  const { data: subscriptions, isLoading } = useSubscriptionsByStatus(status);
  const { data: products } = useApiProducts();
  const approve = useApproveSubscription();
  const reject = useRejectSubscription();

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const handleApprove = async (id: string) => {
    try {
      await approve.mutateAsync(id);
      toast.success("Subscription approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject.mutateAsync(id);
      toast.success("Subscription rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  if (isLoading) return <TableSkeleton />;

  if (!subscriptions?.length) {
    return (
      <EmptyState
        icon={Inbox}
        title={`No ${status} subscriptions`}
        description={`There are no ${status} subscription requests.`}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>API Product</TableHead>
          <TableHead>App ID</TableHead>
          <TableHead>Requested</TableHead>
          {showActions && <TableHead className="w-[120px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell className="font-medium">
              {productMap.get(sub.apiProductId)?.name ?? sub.apiProductId}
            </TableCell>
            <TableCell className="font-mono text-xs">{sub.applicationId}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(sub.requestedAt)}
            </TableCell>
            {showActions && (
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-600"
                    onClick={() => handleApprove(sub.id)}
                    disabled={approve.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleReject(sub.id)}
                    disabled={reject.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
