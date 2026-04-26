import { useAuth } from "react-oidc-context";
import { env } from "@/shared/config/env";

/**
 * Authenticated area: with Keycloak enabled, unauthenticated users are sent to the IdP.
 */
export function AppPage() {
  if (!env.authEnabled) {
    return (
      <div>
        <p style={{ marginTop: 0 }}>
          Auth is <strong>disabled</strong> (<code>VITE_AUTH_ENABLED=false</code>). This route is only a shell; enable auth
          to require Keycloak sign-in here.
        </p>
      </div>
    );
  }

  return <AppPageGuarded />;
}

function AppPageGuarded() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <p>Checking sign-in…</p>;
  }

  if (auth.error) {
    return (
      <p style={{ color: "var(--danger)" }}>
        <strong>Auth error:</strong> {auth.error.message}
      </p>
    );
  }

  if (!auth.isAuthenticated) {
    void auth.signinRedirect();
    return <p>Redirecting to Keycloak…</p>;
  }

  const name = auth.user?.profile?.preferred_username ?? auth.user?.profile?.name ?? "you";
  return (
    <div>
      <p style={{ marginTop: 0 }}>
        You are signed in as <strong>{name}</strong>. This is the protected <code>/app</code> shell for the lab.
      </p>
      <p style={{ color: "var(--muted)", fontSize: 14 }}>
        Tokens are held in memory by the OIDC client; the API validates the access token via JWKS (see Phase C in the
        roadmap).
      </p>
      <button type="button" onClick={() => void auth.signoutRedirect()}>
        Sign out
      </button>
    </div>
  );
}
