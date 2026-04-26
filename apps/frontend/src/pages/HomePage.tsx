import { UserIdentityPlaceholder } from "@/features/auth/components/UserIdentityPlaceholder";
import { HealthStatusPanel } from "@/features/system/components/HealthStatusPanel";
import { env } from "@/shared/config/env";

export function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <UserIdentityPlaceholder />
      <p style={{ margin: 0 }}>
        {env.authEnabled ? (
          <>
            This home page is <strong>only visible after Keycloak sign-in</strong>. Use <strong>Sign out</strong> above to
            end your session.
          </>
        ) : (
          <>
            Auth is disabled (<code>VITE_AUTH_ENABLED=false</code>), so this route stays public for local development.
          </>
        )}
      </p>
      <HealthStatusPanel />
    </div>
  );
}
