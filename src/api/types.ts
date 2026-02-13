// User
export type User = {
  name: string;
  email: string;
  username: string;
  isAdmin?: string;
};

// API Products
export type ApiProductSummary = {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
  versionsCount: number;
  apiProductMetadata?: Record<string, string>;
};

export type ApiProductDetails = {
  autoApproval: boolean;
  contactEmail: string;
  createdAt: string;
  description: string;
  id: string;
  apiProductMetadata: Record<string, string> | null;
  name: string;
  updatedAt: string;
};

export type ApiVersionSchema = {
  components?: {
    schemas: Record<string, unknown>;
  };
  info?: {
    title: string;
    version: string;
  };
  paths: Record<string, unknown>;
  servers?: { url: string }[];
};

export type ApiVersion = {
  apiSpec?: string | ApiVersionSchema;
  createdAt: string;
  documentation: string;
  id: string;
  name: string;
  publicVisible?: boolean;
  status: string;
  title: string;
  updatedAt: string;
  productVersionMetadata?: Record<string, string>;
};

// Teams
export type Team = {
  createdAt: string;
  description: string;
  id: string;
  name: string;
  updatedAt: string;
};

export type Member = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  username: string;
  synced: boolean;
  updatedAt: string;
  deletedAt?: string;
};

// Apps
export type RateLimit = {
  requestsPerUnit: string;
  unit: string;
};

export type AppMetadata = {
  createdAt?: string;
  customMetadata: Record<string, string>;
  deletedAt?: string;
  id: string;
  rateLimit: RateLimit;
  updatedAt: string;
};

export type App = {
  createdAt: string;
  deletedAt: string;
  updatedAt: string;
  id: string;
  idpClientId?: string;
  idpClientName?: string;
  idpClientSecret?: string;
  name: string;
  description: string;
  teamId: string;
  metadata?: AppMetadata;
};

// API Keys
export type ApiKey = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  apiKey: string;
  name: string;
  metadata: Record<string, string>;
};

// OAuth
export type OauthCredential = {
  id: string;
  idpClientId: string;
  idpClientSecret?: string;
  idpClientName: string;
};

// Subscriptions
export type SubscriptionMetadata = {
  createdAt?: string;
  customMetadata: Record<string, string>;
  deletedAt?: string;
  id: string;
  rateLimit: RateLimit;
  updatedAt: string;
};

export type Subscription = {
  apiProductId: string;
  applicationId: string;
  approved?: boolean;
  approvedAt?: string;
  rejected?: boolean;
  rejectedAt?: string;
  createdAt?: string;
  deletedAt?: string;
  id: string;
  requestedAt: string;
  updatedAt: string;
  metadata?: SubscriptionMetadata;
};

export type SubscriptionStatus = "approved" | "pending" | "rejected";

export const RATE_LIMIT_UNITS = [
  "UNKNOWN",
  "SECOND",
  "MINUTE",
  "HOUR",
  "DAY",
  "MONTH",
  "YEAR",
] as const;

export type RateLimitUnit = (typeof RATE_LIMIT_UNITS)[number];
