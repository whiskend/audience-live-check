import {
  type CheckInResponse,
  checkInResponseSchema,
  type HeartbeatResponse,
  heartbeatResponseSchema,
} from "@live-check-in-demo/shared";
import ky from "ky";

const configuredBaseUrl = import.meta.env["VITE_API_BASE_URL"];
const apiBaseUrl = configuredBaseUrl ?? "http://localhost:8080";

const api = ky.create({
  prefixUrl: apiBaseUrl.replace(/\/$/, ""),
  timeout: 10_000,
  retry: 0,
  headers: { "content-type": "application/json" },
});

export async function createCheckIn(
  signal: AbortSignal,
): Promise<CheckInResponse> {
  const payload: unknown = await api.post("api/check-ins", { signal }).json();
  return checkInResponseSchema.parse(payload);
}

export async function sendHeartbeat(
  sessionId: string,
  signal: AbortSignal,
): Promise<HeartbeatResponse> {
  const payload: unknown = await api
    .post(`api/check-ins/${sessionId}/heartbeat`, { signal })
    .json();
  return heartbeatResponseSchema.parse(payload);
}
