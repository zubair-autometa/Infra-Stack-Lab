import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { env } from "@/shared/config/env";

type MePayload = {
  sub?: string;
  preferred_username?: string;
  email?: string;
};

export function UserIdentityPlaceholder() {
  if (!env.authEnabled) {
    return (
      <p style={{ margin: 0, color: "var(--muted)" }}>
        <strong>Signed in as:</strong>{" "}
        <em>auth disabled — set VITE_AUTH_ENABLED=true and OIDC vars to use Keycloak</em>
      </p>
    );
  }

  return <UserIdentityWithOidc />;
}

function UserIdentityWithOidc() {
  const auth = useAuth();
  const [me, setMe] = useState<MePayload | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user?.access_token || !env.apiBaseUrl) {
      setMe(null);
      setMeError(null);
      return;
    }
    let cancelled = false;
    setMeError(null);
    void fetch(`${env.apiBaseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${auth.user.access_token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.text();
          throw new Error(body || res.statusText);
        }
        return res.json() as Promise<MePayload>;
      })
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setMeError(e instanceof Error ? e.message : "Request failed");
      });
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, auth.user?.access_token]);

  if (auth.isLoading) {
    return (
      <p style={{ margin: 0, color: "var(--muted)" }}>
        <strong>Signed in as:</strong> <em>checking session…</em>
      </p>
    );
  }

  if (auth.error) {
    return (
      <p style={{ margin: 0, color: "var(--danger)" }}>
        <strong>Auth error:</strong> {auth.error.message}
      </p>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          <strong>Signed in as:</strong> <em>not signed in</em>
        </p>
        <button type="button" onClick={() => void auth.signinRedirect()}>
          Sign in (Keycloak)
        </button>
      </div>
    );
  }

  const profileName = auth.user?.profile?.preferred_username ?? auth.user?.profile?.name;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <p style={{ margin: 0 }}>
        <strong>Signed in as:</strong> {profileName ?? <em>unknown</em>}
      </p>
      {me && (
        <pre
          style={{
            margin: 0,
            padding: 12,
            background: "var(--code-bg)",
            borderRadius: 6,
            fontSize: 12,
            maxWidth: "100%",
            overflow: "auto",
          }}
        >
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
      {meError && (
        <p style={{ margin: 0, fontSize: 13, color: "var(--danger)" }}>
          <strong>GET /api/me:</strong> {meError}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={() => void auth.signoutRedirect()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
