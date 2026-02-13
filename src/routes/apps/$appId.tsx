import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/api/queries/apps";
import { useApiKeys } from "@/api/queries/api-keys";
import { useOauthCredentials } from "@/api/queries/oauth";
import { useAppSubscriptions } from "@/api/queries/subscriptions";
import { useApiProducts } from "@/api/queries/api-products";
import { useDeleteApp } from "@/api/mutations/apps";
import { useCreateApiKey, useDeleteApiKey } from "@/api/mutations/api-keys";
import { useCreateOauthCredential, useDeleteOauthCredential } from "@/api/mutations/oauth";
import { useCreateSubscription, useDeleteSubscription } from "@/api/mutations/subscriptions";
import { AuthGuard } from "@/components/auth/auth-guard";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { CopyButton } from "@/components/common/copy-button";
import { CardSkeleton, TableSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ArrowLeft, Key, Plus, Shield, Trash2, Link2, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import type { ApiKey, OauthCredential } from "@/api/types";

export const Route = createFileRoute("/apps/$appId")({
  component: () => (
    <AuthGuard>
      <AppDetailPage />
    </AuthGuard>
  ),
});

function AppDetailPage() {
  const { appId } = Route.useParams();
  const navigate = useNavigate();
  const { data: app, isLoading } = useApp(appId);
  const deleteApp = useDeleteApp();
  const [showDeleteApp, setShowDeleteApp] = useState(false);

  if (isLoading) return <CardSkeleton />;

  if (!app) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="App not found"
        description="This application does not exist or you don't have access."
      />
    );
  }

  const handleDelete = async () => {
    try {
      await deleteApp.mutateAsync(appId);
      toast.success("Application deleted");
      navigate({ to: "/apps" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete app");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/apps" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          Apps
        </Link>
        <span>/</span>
        <span className="text-foreground">{app.name}</span>
      </div>

      <PageHeader
        title={app.name}
        description={app.description || undefined}
        actions={
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteApp(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        }
      />

      <ApiKeysSection appId={appId} />
      <Separator />
      <OAuthSection appId={appId} />
      <Separator />
      <SubscriptionsSection appId={appId} />

      <ConfirmDialog
        open={showDeleteApp}
        onOpenChange={setShowDeleteApp}
        title="Delete application"
        description={`Are you sure you want to delete "${app.name}"? All API keys and subscriptions will be removed.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteApp.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// --- API Keys Section ---

function ApiKeysSection({ appId }: { appId: string }) {
  const { data: keys, isLoading } = useApiKeys(appId);
  const createKey = useCreateApiKey();
  const deleteKey = useDeleteApiKey();
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createKey.mutateAsync({ appId, apiKeyName: keyName });
      setNewKey(created);
      setKeyName("");
      setShowCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create API key");
    }
  };

  const handleDelete = async () => {
    if (!keyToDelete) return;
    try {
      await deleteKey.mutateAsync({ keyId: keyToDelete, appId });
      toast.success("API key deleted");
      setKeyToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete API key");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </CardTitle>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Key
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={2} />
          ) : !keys?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No API keys yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium font-mono text-sm">{key.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setKeyToDelete(key.id)}
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

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="production-key"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!keyName.trim() || createKey.isPending}>
                {createKey.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Secret reveal dialog */}
      <Dialog open={!!newKey} onOpenChange={(open) => !open && setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Copy this key now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 bg-muted rounded-md p-3">
            <code className="text-sm font-mono flex-1 break-all">{newKey?.apiKey}</code>
            {newKey?.apiKey && <CopyButton value={newKey.apiKey} />}
          </div>
          <DialogFooter>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!keyToDelete}
        onOpenChange={(open) => !open && setKeyToDelete(null)}
        title="Delete API key"
        description="Are you sure? This key will immediately stop working."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteKey.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

// --- OAuth Section ---

function OAuthSection({ appId }: { appId: string }) {
  const { data: creds, isLoading, isError } = useOauthCredentials(appId);
  const createOauth = useCreateOauthCredential();
  const deleteOauth = useDeleteOauthCredential();
  const [newCreds, setNewCreds] = useState<OauthCredential | null>(null);
  const [showDeleteOauth, setShowDeleteOauth] = useState(false);

  const handleCreate = async () => {
    try {
      const created = await createOauth.mutateAsync(appId);
      setNewCreds(created);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create OAuth credentials");
    }
  };

  const handleDelete = async () => {
    if (!creds) return;
    try {
      await deleteOauth.mutateAsync({ credentialId: creds.id, appId });
      toast.success("OAuth credentials deleted");
      setShowDeleteOauth(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            OAuth Credentials
          </CardTitle>
          {!creds && !isLoading && (
            <Button size="sm" onClick={handleCreate} disabled={createOauth.isPending} className="gap-2">
              <Plus className="h-4 w-4" />
              {createOauth.isPending ? "Creating..." : "Create OAuth Client"}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={1} />
          ) : isError || !creds ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No OAuth credentials configured.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground font-mono text-xs">client_id</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs">{creds.idpClientId}</code>
                  <CopyButton value={creds.idpClientId} />
                </div>
                <span className="text-muted-foreground font-mono text-xs">client_name</span>
                <span>{creds.idpClientName}</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteOauth(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secret reveal */}
      <Dialog open={!!newCreds} onOpenChange={(open) => !open && setNewCreds(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OAuth Client Created</DialogTitle>
            <DialogDescription>
              Copy the client secret now. You won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 bg-muted rounded-md p-3">
              <span className="text-xs text-muted-foreground font-mono w-20">client_id</span>
              <code className="text-sm font-mono flex-1 break-all">{newCreds?.idpClientId}</code>
              {newCreds?.idpClientId && <CopyButton value={newCreds.idpClientId} />}
            </div>
            {newCreds?.idpClientSecret && (
              <div className="flex items-center gap-2 bg-muted rounded-md p-3">
                <span className="text-xs text-muted-foreground font-mono w-20">secret</span>
                <code className="text-sm font-mono flex-1 break-all">{newCreds.idpClientSecret}</code>
                <CopyButton value={newCreds.idpClientSecret} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setNewCreds(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteOauth}
        onOpenChange={setShowDeleteOauth}
        title="Delete OAuth credentials"
        description="Are you sure? Applications using these credentials will stop working."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteOauth.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

// --- Subscriptions Section ---

function SubscriptionsSection({ appId }: { appId: string }) {
  const { data: subscriptions, isLoading } = useAppSubscriptions(appId);
  const { data: products } = useApiProducts();
  const createSub = useCreateSubscription();
  const deleteSub = useDeleteSubscription();
  const [showCreate, setShowCreate] = useState(false);
  const [productId, setProductId] = useState("");
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSub.mutateAsync({ appId, apiProductId: productId });
      toast.success("Subscription created");
      setProductId("");
      setShowCreate(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to subscribe");
    }
  };

  const handleDelete = async () => {
    if (!subToDelete) return;
    try {
      await deleteSub.mutateAsync({ subscriptionId: subToDelete, appId });
      toast.success("Subscription removed");
      setSubToDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  function getStatus(sub: { approved?: boolean; rejected?: boolean }) {
    if (sub.approved) return "approved";
    if (sub.rejected) return "rejected";
    return "pending";
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Subscriptions
          </CardTitle>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Subscribe
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={2} />
          ) : !subscriptions?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No subscriptions yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Product</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => {
                  const status = getStatus(sub);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {productMap.get(sub.apiProductId)?.name ?? sub.apiProductId}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            status === "approved"
                              ? "secondary"
                              : status === "rejected"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(sub.requestedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setSubToDelete(sub.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create subscription dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to API</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>API Product</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select API product" />
                </SelectTrigger>
                <SelectContent>
                  {(products ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!productId || createSub.isPending}>
                {createSub.isPending ? "Subscribing..." : "Subscribe"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!subToDelete}
        onOpenChange={(open) => !open && setSubToDelete(null)}
        title="Remove subscription"
        description="Are you sure you want to remove this subscription?"
        confirmLabel="Remove"
        variant="destructive"
        loading={deleteSub.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
