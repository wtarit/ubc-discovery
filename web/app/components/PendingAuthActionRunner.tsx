import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import {
  clearPendingSave,
  consumeReturnPath,
  markPendingSaveFailed,
  readPendingSave,
  retryPendingSave,
} from "~/lib/auth-flow";

export function PendingAuthActionRunner() {
  const { token, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const running = useRef(false);
  const [failed, setFailed] = useState(() => readPendingSave()?.status === "failed");

  const runPendingSave = useCallback(async () => {
    const action = readPendingSave();
    if (!token || !profile || !action || action.status !== "pending" || running.current) {
      return;
    }

    running.current = true;
    setFailed(false);
    try {
      await api.saved.save(token, action.eventId);
      await queryClient.invalidateQueries({
        queryKey: ["saved-events", profile.id],
      });
      clearPendingSave();
      consumeReturnPath();
      navigate(action.returnPath, { replace: true });
    } catch {
      markPendingSaveFailed();
      setFailed(true);
    } finally {
      running.current = false;
    }
  }, [navigate, profile, queryClient, token]);

  useEffect(() => {
    void runPendingSave();
  }, [runPendingSave]);

  if (!failed) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 z-[100] border-2 border-ink bg-bg p-4 shadow-[3px_3px_0_var(--color-ink)] md:left-auto md:right-6 md:bottom-6 md:w-[380px]"
    >
      <p className="font-display font-bold text-ink">The event was not saved.</p>
      <p className="mt-1 text-sm text-ink-soft">
        Your sign-in succeeded. Retry the save when the connection is available.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            retryPendingSave();
            void runPendingSave();
          }}
          className="border border-accent bg-accent px-3 py-2 font-mono text-[11px] font-bold uppercase text-white"
        >
          Retry save
        </button>
        <button
          type="button"
          onClick={() => {
            clearPendingSave();
            setFailed(false);
          }}
          className="border border-ink bg-bg px-3 py-2 font-mono text-[11px] font-bold uppercase text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
