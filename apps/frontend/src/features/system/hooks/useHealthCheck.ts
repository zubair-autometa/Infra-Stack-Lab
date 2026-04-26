import { useState } from "react";
import { getHealth } from "@/shared/services/healthService";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; body: unknown }
  | { status: "error"; message: string };

export function useHealthCheck() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function run() {
    setState({ status: "loading" });
    const result = await getHealth();
    if (result.ok) setState({ status: "ok", body: result.body });
    else setState({ status: "error", message: result.message });
  }

  return { state, run };
}
