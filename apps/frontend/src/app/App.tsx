import type { ReactNode } from "react";
import { AuthProvider, type AuthProviderProps } from "react-oidc-context";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AppRoutes } from "@/app/routes";
import { AppShell } from "@/shared/layout/AppShell";
import { env, isOidcConfigured } from "@/shared/config/env";

function oidcSettings(): AuthProviderProps {
  const postLogout =
    env.oidcPostLogoutRedirectUri ||
    (typeof window !== "undefined" ? `${window.location.origin}/` : "http://localhost:5173/");
  return {
    authority: env.oidcAuthority,
    client_id: env.oidcClientId,
    redirect_uri: env.oidcRedirectUri,
    post_logout_redirect_uri: postLogout,
    response_type: "code",
    scope: "openid profile email",
    automaticSilentRenew: false,
  };
}

function OidcConfigMissing() {
  return (
    <div style={{ maxWidth: 640, margin: "48px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: "1.25rem" }}>OIDC configuration incomplete</h1>
      <p>
        <code>VITE_AUTH_ENABLED</code> is true, but one of <code>VITE_OIDC_AUTHORITY</code>, <code>VITE_OIDC_CLIENT_ID</code>
        , or <code>VITE_OIDC_REDIRECT_URI</code> is missing. Set them in <code>.env</code> (local) or Docker build args (see{" "}
        <code>docker/backend/default.env</code>).
      </p>
    </div>
  );
}

function AuthWrapper({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const base = oidcSettings();

  return (
    <AuthProvider {...base} onSigninCallback={() => void navigate("/", { replace: true })}>
      {children}
    </AuthProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      {!env.authEnabled ? (
        <AppShell>
          <AppRoutes />
        </AppShell>
      ) : !isOidcConfigured() ? (
        <OidcConfigMissing />
      ) : (
        <AuthWrapper>
          <AppShell>
            <AppRoutes />
          </AppShell>
        </AuthWrapper>
      )}
    </BrowserRouter>
  );
}
