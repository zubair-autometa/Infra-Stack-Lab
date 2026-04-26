import { env } from "@/shared/config/env";

export type HealthResult =
  | { ok: true; body: unknown }
  | { ok: false; message: string };

export async function getHealth(): Promise<HealthResult> {
  if (!env.apiBaseUrl) {
    return { ok: false, message: "VITE_API_BASE_URL is not set" };
  }
  try {
    const response = await fetch(`${env.apiBaseUrl}/health`);
    const text = await response.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // Non-JSON health response is acceptable in early phases.
    }

    if (!response.ok) {
      return { ok: false, message: `HTTP ${response.status}` };
    }
    return { ok: true, body };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return { ok: false, message: `Network: ${message}` };
  }
}
