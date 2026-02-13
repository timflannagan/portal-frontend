declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

function getEnv(key: string, fallback?: string): string {
  const runtimeVal = window.__ENV__?.[key];
  if (runtimeVal !== undefined && runtimeVal !== "") return runtimeVal;
  const viteVal = import.meta.env[key] as string | undefined;
  if (viteVal !== undefined && viteVal !== "") return viteVal;
  return fallback ?? "";
}

let serverUrl = getEnv("VITE_PORTAL_SERVER_URL", "/v1");
if (serverUrl.endsWith("/")) {
  serverUrl = serverUrl.slice(0, -1);
}

export const env = {
  portalServerUrl: serverUrl,
  bearerToken: getEnv("VITE_BEARER_TOKEN"),
  companyName: getEnv("VITE_COMPANY_NAME", "Developer Portal"),
  // OIDC auth code flow (server-side via ExtAuth)
  oidcEnabled: getEnv("VITE_APPLIED_OIDC_AUTH_CODE_CONFIG") === "true",
  oidcCallbackPath: getEnv("VITE_OIDC_AUTH_CODE_CONFIG_CALLBACK_PATH", "/v1/login"),
  oidcLogoutPath: getEnv("VITE_OIDC_AUTH_CODE_CONFIG_LOGOUT_PATH", "/v1/logout"),
} as const;
