import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApiProducts } from "@/api/queries/api-products";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { CardGridSkeleton } from "@/components/common/loading-skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/apis/")({
  component: ApisPage,
});

function ApisPage() {
  const { data: products, isLoading } = useApiProducts();
  const [search, setSearch] = useState("");

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="API Products"
        description="Browse available APIs and their documentation."
      />

      <div className="mb-6 max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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
          {filtered.map((product) => (
            <Link
              key={product.id}
              to="/apis/$productId"
              params={{ productId: product.id }}
              className="block group"
            >
              <Card className="h-full transition-colors group-hover:border-foreground/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{product.name}</CardTitle>
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
          ))}
        </div>
      )}
    </div>
  );
}
