import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/api/client";
import type { ApiProductSummary, ApiProductDetails, ApiVersion } from "@/api/types";

export const apiProductKeys = {
  all: ["api-products"] as const,
  detail: (id: string) => ["api-products", id] as const,
  versions: (id: string) => ["api-products", id, "versions"] as const,
};

export function useApiProducts() {
  return useQuery({
    queryKey: apiProductKeys.all,
    queryFn: () => fetchJson<ApiProductSummary[]>("/api-products"),
  });
}

export function useApiProductDetails(productId: string) {
  return useQuery({
    queryKey: apiProductKeys.detail(productId),
    queryFn: () => fetchJson<ApiProductDetails>(`/api-products/${productId}`),
    enabled: !!productId,
  });
}

export function useApiProductVersions(productId: string) {
  return useQuery({
    queryKey: apiProductKeys.versions(productId),
    queryFn: () => fetchJson<ApiVersion[]>(`/api-products/${productId}/versions`),
    enabled: !!productId,
  });
}
