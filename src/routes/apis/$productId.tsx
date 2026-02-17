import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApiProductDetails, useApiProductVersions } from "@/api/queries/api-products";
import { CardSkeleton } from "@/components/common/loading-skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, BookOpen, Mail, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ApiVersion, ApiVersionSchema } from "@/api/types";
import { lazy, Suspense } from "react";

import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = lazy(() => import("swagger-ui-react"));

export const Route = createFileRoute("/apis/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading: loadingProduct } = useApiProductDetails(productId);
  const { data: versions, isLoading: loadingVersions } = useApiProductVersions(productId);
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [specView, setSpecView] = useState<"redoc" | "swagger">("redoc");

  const selectedVersion = versions?.find((v) => v.id === selectedVersionId) ?? versions?.[0];

  // Set initial selected version when data loads
  if (versions?.length && !selectedVersionId) {
    setSelectedVersionId(versions[0].id);
  }

  const spec = getSpec(selectedVersion);

  if (loadingProduct) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={FileText}
        title="Product not found"
        description="This API product does not exist or you don't have access."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/apis" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          APIs
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-muted-foreground mt-1">{product.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {product.autoApproval ? (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Auto-approve
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> Manual approval
            </Badge>
          )}
        </div>
      </div>

      {product.contactEmail && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          {product.contactEmail}
        </div>
      )}

      {/* Version selector + spec view */}
      {loadingVersions ? (
        <CardSkeleton />
      ) : !versions?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No versions"
          description="This API product has no published versions."
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <Select value={selectedVersion?.id ?? ""} onValueChange={setSelectedVersionId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    {versions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name || v.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVersion && (
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(selectedVersion.updatedAt)}
                  </span>
                )}
              </div>
              {spec && (
                <Tabs value={specView} onValueChange={(v) => setSpecView(v as "redoc" | "swagger")}>
                  <TabsList>
                    <TabsTrigger value="redoc">Documentation</TabsTrigger>
                    <TabsTrigger value="swagger">Try it</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedVersion?.documentation && (
              <div
                className="prose prose-sm max-w-none mb-6 text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: selectedVersion.documentation }}
              />
            )}
            {spec ? (
              <div className="border rounded-md overflow-hidden">
                {specView === "swagger" ? (
                  <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Swagger UI...</div>}>
                    <SwaggerUI spec={spec} />
                  </Suspense>
                ) : (
                  <RedocDisplay spec={spec} />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No OpenAPI spec available for this version.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getSpec(version: ApiVersion | undefined): ApiVersionSchema | null {
  if (!version?.apiSpec) return null;
  if (typeof version.apiSpec === "string") {
    try {
      return JSON.parse(version.apiSpec) as ApiVersionSchema;
    } catch {
      return null;
    }
  }
  return version.apiSpec;
}

function RedocDisplay({ spec }: { spec: ApiVersionSchema }) {
  // Redoc requires a DOM mount; we use a simple iframe-less approach
  // by rendering the spec info and paths as structured content
  return (
    <div className="p-6 space-y-6">
      {spec.info && (
        <div>
          <h3 className="text-lg font-semibold">{spec.info.title}</h3>
          <p className="text-sm text-muted-foreground">Version {spec.info.version}</p>
        </div>
      )}
      {spec.servers && spec.servers.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Servers</h4>
          <div className="space-y-1">
            {spec.servers.map((s, i) => (
              <code key={i} className="block text-xs bg-muted px-2 py-1 rounded font-mono">
                {s.url}
              </code>
            ))}
          </div>
        </div>
      )}
      {spec.paths && Object.keys(spec.paths).length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Endpoints</h4>
          <div className="space-y-2">
            {Object.entries(spec.paths).map(([path, methods]) => (
              <div key={path} className="border rounded-md p-3">
                <code className="text-sm font-mono font-medium">{path}</code>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {Object.keys(methods as Record<string, unknown>).map((method) => (
                    <Badge key={method} variant={methodVariant(method)} className="text-xs uppercase font-mono">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function methodVariant(method: string): "default" | "secondary" | "destructive" | "outline" {
  switch (method.toLowerCase()) {
    case "get":
      return "secondary";
    case "post":
      return "default";
    case "delete":
      return "destructive";
    default:
      return "outline";
  }
}
