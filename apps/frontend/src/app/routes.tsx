import { withAuthenticationRequired } from "react-oidc-context";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { AppPage } from "@/pages/AppPage";
import { OidcSigninLanding } from "@/pages/OidcSigninLanding";
import { env } from "@/shared/config/env";

/** Home requires a Keycloak session when `VITE_AUTH_ENABLED` is true (must render under `AuthProvider`). */
const HomePageProtected = withAuthenticationRequired(HomePage, {
  OnRedirecting: () => (
    <div style={{ padding: 24 }}>
      <p style={{ margin: 0 }}>Redirecting to sign-in…</p>
    </div>
  ),
});

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={env.authEnabled ? <HomePageProtected /> : <HomePage />} />
      {env.authEnabled && <Route path="/signin-callback" element={<OidcSigninLanding />} />}
      {env.appRouteEnabled && <Route path="/app" element={<AppPage />} />}
    </Routes>
  );
}
