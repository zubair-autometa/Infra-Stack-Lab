import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { env } from "@/shared/config/env";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px 48px" }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{env.appName}</p>
        <h1 style={{ margin: "6px 0 0", fontSize: "1.5rem", fontWeight: 650 }}>Infra Stack Lab</h1>
        <nav style={{ marginTop: 16, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <NavLink to="/" style={({ isActive }) => ({ fontWeight: isActive ? 650 : 400, color: isActive ? "var(--text)" : "var(--muted)" })} end>Home</NavLink>
          {env.appRouteEnabled && (
            <NavLink to="/app" style={({ isActive }) => ({ fontWeight: isActive ? 650 : 400, color: isActive ? "var(--text)" : "var(--muted)" })}>
              App (protected placeholder)
            </NavLink>
          )}
          <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite docs</a>
        </nav>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--muted)" }}>
          Stage: <code>{env.stage}</code>
          {env.authEnabled ? (
            <>
              {" "}
              · Keycloak OIDC <code>{env.oidcAuthority || "—"}</code>
            </>
          ) : (
            <>
              {" "}
              · Set <code>VITE_API_BASE_URL</code> and OIDC vars in <code>.env</code> for full stack.
            </>
          )}
        </p>
      </header>
      <main>{children}</main>
      <footer style={{ marginTop: 32, fontSize: 12, color: "var(--muted)" }}>
        <Link to="/">Home</Link>
        {env.appRouteEnabled && <> {" · "}<Link to="/app">App</Link></>}
      </footer>
    </div>
  );
}
