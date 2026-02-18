import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApiProducts } from "@/api/queries/api-products";
import { useAllSubscriptions } from "@/api/queries/subscriptions";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardGridSkeleton } from "@/components/common/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackageOpen, Search, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/apis/")({
  component: ApisPage,
});

type SubscriptionFilter = "all" | "subscribed" | "pending" | "not-subscribed";

function ApisPage() {
  const { data: products, isLoading } = useApiProducts();
  const { statusByProduct } = useAllSubscriptions();
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState<SubscriptionFilter>("all");

  const filtered = (products ?? [])
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((p) => {
      if (subFilter === "all") return true;
      const status = statusByProduct.get(p.id);
      if (subFilter === "subscribed") return status === "approved";
      if (subFilter === "pending") return status === "pending";
      if (subFilter === "not-subscribed") return !status;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <PageHeader
        title="API Products"
        description="Browse available APIs and their documentation."
      />

      <div className="mb-6 flex gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subFilter} onValueChange={(v) => setSubFilter(v as SubscriptionFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All APIs</SelectItem>
            <SelectItem value="subscribed">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" /> Subscribed
              </span>
            </SelectItem>
            <SelectItem value="pending">
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3" /> Pending
              </span>
            </SelectItem>
            <SelectItem value="not-subscribed">Not Subscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <CardGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="No API products found"
          description={
            search
              ? "Try adjusting your search terms."
              : "No API products are available yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const subStatus = statusByProduct.get(product.id);
            return (
              <Link
                key={product.id}
                to="/apis/$productId"
                params={{ productId: product.id }}
                className="block group"
              >
                <Card className="h-full transition-colors group-hover:border-foreground/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{product.name}</CardTitle>
                        {subStatus === "approved" && (
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        )}
                        {subStatus === "pending" && (
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {product.apiProductMetadata?.category && (
                          <Badge 
                            variant={product.apiProductMetadata.category.toLowerCase().includes("auth") ? "default" : "outline"} 
                            className="text-xs"
                          >
                            {product.apiProductMetadata.category.replace(" APIs", "")}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {product.versionsCount} version{product.versionsCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {product.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(product.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
