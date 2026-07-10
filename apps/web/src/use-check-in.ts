import type { CheckInResponse } from "@live-check-in-demo/shared";
import { useCallback, useEffect, useRef, useState } from "react";
import { createCheckIn, sendHeartbeat } from "./api-client";
import {
  clearStoredSession,
  readStoredSession,
  type StoredSession,
  saveStoredSession,
} from "./check-in-storage";

const MAX_HEARTBEAT_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

export type CheckInStatus =
  | "idle"
  | "starting"
  | "active"
  | "completed"
  | "error";

type CheckInState = {
  readonly status: CheckInStatus;
  readonly message: string;
};

const INITIAL_STATE: CheckInState = {
  status: "idle",
  message: "발표 데모에 참여해 주세요.",
};

export function useCheckIn(): CheckInState & { readonly start: () => void } {
  const [state, setState] = useState<CheckInState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const updateState = useCallback((next: CheckInState): void => {
    if (mountedRef.current) {
      setState(next);
    }
  }, []);

  const wait = useCallback(
    (durationMs: number, signal: AbortSignal): Promise<void> => {
      return new Promise((resolve, reject) => {
        let timer: number | undefined;
        const abort = (): void => {
          if (timer !== undefined) {
            window.clearTimeout(timer);
          }
          signal.removeEventListener("abort", abort);
          reject(new DOMException("Heartbeat cancelled", "AbortError"));
        };
        timer = window.setTimeout(() => {
          signal.removeEventListener("abort", abort);
          resolve();
        }, durationMs);
        signal.addEventListener("abort", abort, { once: true });
      });
    },
    [],
  );

  const runHeartbeatLoop = useCallback(
    async (
      session: StoredSession,
      controller: AbortController,
    ): Promise<void> => {
      const expiresAtMs = Date.parse(session.expiresAt);
      let retryCount = 0;

      while (Date.now() < expiresAtMs && !controller.signal.aborted) {
        try {
          await sendHeartbeat(session.sessionId, controller.signal);
        } catch (error) {
          if (
            controller.signal.aborted ||
            (error instanceof DOMException && error.name === "AbortError")
          ) {
            return;
          }
          if (retryCount >= MAX_HEARTBEAT_RETRIES) {
            clearStoredSession();
            controllerRef.current = null;
            updateState({
              status: "error",
              message: "연결을 확인하지 못했습니다. 다시 참여해 주세요.",
            });
            return;
          }
          retryCount += 1;
          if (Date.now() + RETRY_DELAY_MS >= expiresAtMs) {
            clearStoredSession();
            controllerRef.current = null;
            updateState({
              status: "error",
              message: "연결을 확인하지 못했습니다. 다시 참여해 주세요.",
            });
            return;
          }
          await wait(RETRY_DELAY_MS, controller.signal);
          continue;
        }

        const remainingMs = expiresAtMs - Date.now();
        if (remainingMs <= 0) {
          break;
        }
        await wait(
          Math.min(session.heartbeatIntervalMs, remainingMs),
          controller.signal,
        );
      }

      if (!controller.signal.aborted) {
        clearStoredSession();
        controllerRef.current = null;
        updateState({
          status: "completed",
          message: "발표 화면을 확인해 주세요.",
        });
      }
    },
    [updateState, wait],
  );

  const beginSession = useCallback(
    (session: CheckInResponse, controller: AbortController): void => {
      if (controller.signal.aborted || !mountedRef.current) {
        return;
      }
      saveStoredSession(session);
      updateState({
        status: "active",
        message: "이제 발표 화면을 확인해 주세요.",
      });
      void runHeartbeatLoop(session, controller).catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        clearStoredSession();
        controllerRef.current = null;
        updateState({
          status: "error",
          message: "연결을 확인하지 못했습니다. 다시 참여해 주세요.",
        });
      });
    },
    [runHeartbeatLoop, updateState],
  );

  const start = useCallback((): void => {
    if (controllerRef.current !== null) {
      return;
    }

    updateState({ status: "starting", message: "참여를 시작하고 있습니다." });
    const controller = new AbortController();
    controllerRef.current = controller;
    void createCheckIn(controller.signal)
      .then((session) => beginSession(session, controller))
      .catch((error: unknown) => {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        controllerRef.current = null;
        updateState({
          status: "error",
          message: "참여를 시작하지 못했습니다. 다시 시도해 주세요.",
        });
      });
  }, [beginSession, updateState]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const storedSession = readStoredSession();
    if (storedSession === null || controllerRef.current !== null) {
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    updateState({
      status: "active",
      message: "이제 발표 화면을 확인해 주세요.",
    });
    void runHeartbeatLoop(storedSession, controller).catch((error: unknown) => {
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        return;
      }
      clearStoredSession();
      controllerRef.current = null;
      updateState({
        status: "error",
        message: "연결을 확인하지 못했습니다. 다시 참여해 주세요.",
      });
    });

    return () => {
      controller.abort();
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }
    };
  }, [runHeartbeatLoop, updateState]);

  return { ...state, start };
}
