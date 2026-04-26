import type { CSSProperties } from "react";
import { env } from "@/shared/config/env";
import { useHealthCheck } from "@/features/system/hooks/useHealthCheck";

export function HealthStatusPanel() {
  const { state, run } = useHealthCheck();

  return (
    <section aria-labelledby="api-status-heading" style={panelStyle}>
      <h2 id="api-status-heading" style={h2Style}>
        API / health
      </h2>
      <p style={mono}>
        <strong>VITE_API_BASE_URL:</strong>{" "}
        {env.apiBaseUrl ? env.apiBaseUrl : <em style={{ color: "var(--muted)" }}>not set</em>}
      </p>
      <button type="button" onClick={run} disabled={state.status === "loading" || !env.apiBaseUrl}>
        {state.status === "loading" ? "Pinging..." : "Ping GET /health"}
      </button>
      <div style={{ marginTop: 12 }} role="status" aria-live="polite">
        {state.status === "idle" && <span style={{ color: "var(--muted)" }}>Not checked yet.</span>}
        {state.status === "loading" && <span>Calling API...</span>}
        {state.status === "ok" && <pre style={preStyle}>{JSON.stringify(state.body, null, 2)}</pre>}
        {state.status === "error" && <span style={{ color: "var(--danger)" }}>{state.message}</span>}
      </div>
    </section>
  );
}

const panelStyle: CSSProperties = { border: "1px solid var(--border)", borderRadius: 8, padding: 16, background: "var(--panel)" };
const h2Style: CSSProperties = { marginTop: 0, fontSize: "1.1rem" };
const mono: CSSProperties = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", fontSize: 12, wordBreak: "break-all" };
const preStyle: CSSProperties = { margin: 0, padding: 12, background: "var(--code-bg)", borderRadius: 6, overflow: "auto", fontSize: 12 };
