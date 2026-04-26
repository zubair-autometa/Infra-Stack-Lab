/**
 * Keycloak redirects here with ?code=&state=. `AuthProvider` runs `signinCallback` automatically;
 * this route only shows feedback while that completes.
 */
export function OidcSigninLanding() {
  return (
    <div style={{ padding: 24 }}>
      <p style={{ margin: 0 }}>Completing sign-in…</p>
    </div>
  );
}
