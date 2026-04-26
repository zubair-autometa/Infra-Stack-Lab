function normalizeUrl(input?: string): string {
  if (!input) return "";
  return input.trim().replace(/\/$/, "");
}

function toBool(input: string | undefined, fallback: boolean): boolean {
  if (input === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(input.toLowerCase());
}

export const env = {
  appName: (import.meta.env.VITE_APP_NAME || "Infra Stack Lab").trim(),
  stage: (import.meta.env.VITE_STAGE || "local").trim(),
  apiBaseUrl: normalizeUrl(import.meta.env.VITE_API_BASE_URL),
  appRouteEnabled: toBool(import.meta.env.VITE_ENABLE_APP_ROUTE, true),
  authEnabled: toBool(import.meta.env.VITE_AUTH_ENABLED, false),
  /** Issuer base URL, e.g. http://localhost:8080/realms/learning */
  oidcAuthority: normalizeUrl(import.meta.env.VITE_OIDC_AUTHORITY),
  oidcClientId: (import.meta.env.VITE_OIDC_CLIENT_ID || "").trim(),
  oidcRedirectUri: normalizeUrl(import.meta.env.VITE_OIDC_REDIRECT_URI),
  oidcPostLogoutRedirectUri: normalizeUrl(import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI),
  isDev: import.meta.env.DEV,
} as const;

/** True when env asks for auth and Vite injected the minimum OIDC build-time vars. */
export function isOidcConfigured(): boolean {
  return env.authEnabled && !!env.oidcAuthority && !!env.oidcClientId && !!env.oidcRedirectUri;
}
