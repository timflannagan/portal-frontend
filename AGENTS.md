# AGENTS.md

## What This Is

Developer portal frontend for Gloo Gateway's portal-enterprise backend. React 19 SPA that implements the `/v1` REST API contract for API catalog browsing, team/app management, credential generation, and subscription workflows.

## Tech Stack

- React 19, Vite 6 (v7 dep), TypeScript 5.9
- shadcn/ui + Tailwind CSS 4 (components in `src/components/ui/`)
- TanStack Router (file-based routes in `src/routes/`)
- TanStack Query (queries in `src/api/queries/`, mutations in `src/api/mutations/`)
- Redoc + Swagger UI for OpenAPI spec rendering
- Express production server (`server.js`) with runtime env injection

## Project Structure

```
src/
  api/client.ts          # fetch wrapper, auth header injection
  api/types.ts           # TypeScript types matching backend responses
  api/queries/           # useQuery hooks per resource domain
  api/mutations/         # useMutation hooks per resource domain
  config/env.ts          # Runtime env reader (window.__ENV__ || import.meta.env)
  hooks/use-auth.ts      # Auth state (dual-mode: Bearer token or OIDC)
  hooks/use-is-admin.ts  # Admin detection from user object
  components/layout/     # Header, root layout
  components/auth/       # Auth guard, token input dialog
  components/ui/         # shadcn/ui primitives (don't edit manually)
  routes/                # TanStack Router file-based routes
server.js                # Express prod server, injects VITE_* as window.__ENV__
Dockerfile               # Two-stage node:22-alpine build + serve
```

## Auth Modes

Two modes controlled by `VITE_APPLIED_OIDC_AUTH_CODE_CONFIG`:

- **Token mode** (default): User pastes a Bearer token via UI dialog, stored in localStorage
- **OIDC mode**: Redirects to `/v1/login`, ExtAuth handles Keycloak flow, session cookie auth with `credentials: "include"`

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run start     # Express production server on port 4000
```

## Local Testing

Use the portal-enterprise hack script to deploy into a Kind cluster:

```bash
# Build and load image
docker build -t portal-frontend:dev .
./hack/setup-test-portal.sh -n 5 -v 2 --auth-apis --keycloak -ns portal-system \
  --frontend-image portal-frontend:dev --load-image
```

## Backend Contract

The source of truth is the portal-enterprise REST API (`/v1`). This frontend is a consumer of that API — it does not define its own data models or business logic. All TypeScript types in `src/api/types.ts` are derived from the backend response shapes, and all query/mutation hooks map directly to backend endpoints.

When the backend changes (new fields, new endpoints, changed behavior), the frontend types and hooks should be updated to match. The backend route definitions live in `internal/backend/server.go` in the portal-enterprise repo (`/work/portal-enterprise/`).

## Known Gaps

- Backend doesn't gate API access based on subscription approval status (portal-enterprise#15)
- Team deletion cascades all dependent resources without warning (portal-enterprise#16)
- `autoApproval` field on ApiProduct is not implemented server-side
