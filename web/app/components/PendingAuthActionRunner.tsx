import { useCallback, useEffect, useRef, useState } from "react";
import {
  type QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { api, type UserResponse } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import {
  completeAuthAction,
  markAuthActionFailed,
  readAuthFlow,
  retryAuthAction,
  type PostAuthAction,
} from "~/lib/auth-flow";

type AuthActionContext = {
  profile: UserResponse;
  queryClient: QueryClient;
};

type AuthActionHandler = {
  run: (payload: unknown, context: AuthActionContext) => Promise<void>;
  afterSuccess?: (context: AuthActionContext) => Promise<void>;
  failureTitle: string;
  failureMessage: string;
  retryLabel: string;
};

function readEventId(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "eventId" in payload &&
    typeof payload.eventId === "string" &&
    payload.eventId.length > 0
  ) {
    return payload.eventId;
  }
  throw new Error("Invalid save-event authentication action.");
}

// Add future authentication-gated feature handlers to this registry.
const authActionHandlers: Record<string, AuthActionHandler> = {
  "save-event": {
    async run(payload) {
      await api.saved.save(readEventId(payload));
    },
    async afterSuccess({ profile, queryClient }) {
      await queryClient.invalidateQueries({
        queryKey: ["saved-events", profile.id],
      });
    },
    failureTitle: "The event was not saved.",
    failureMessage:
      "Your sign-in succeeded. Retry the save when the connection is available.",
    retryLabel: "Retry save",
  },
};

const unknownActionHandler: Omit<AuthActionHandler, "run"> = {
  failureTitle: "The requested action could not be completed.",
  failureMessage:
    "Your sign-in succeeded, but this action is no longer supported.",
  retryLabel: "Retry action",
};

function findFailedAction(actionId: string | null) {
  if (!actionId) return null;
  return (
    readAuthFlow()?.actions.find(
      (action) => action.id === actionId && action.status === "failed"
    ) ?? null
  );
}

export function PendingAuthActionRunner() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const running = useRef(false);
  const [failedActionId, setFailedActionId] = useState(
    () =>
      readAuthFlow()?.actions.find((action) => action.status === "failed")?.id ??
      null
  );

  const runPendingActions = useCallback(async () => {
    if (!profile || running.current) return;

    running.current = true;
    const context = { profile, queryClient };
    try {
      while (true) {
        const action = readAuthFlow()?.actions.find(
          (candidate) => candidate.status === "pending"
        );
        if (!action) return;

        const handler = authActionHandlers[action.type];
        if (!handler) {
          markAuthActionFailed(action.id);
          setFailedActionId(action.id);
          return;
        }

        try {
          await handler.run(action.payload, context);
        } catch {
          markAuthActionFailed(action.id);
          setFailedActionId(action.id);
          return;
        }

        const completion = completeAuthAction(action.id);
        setFailedActionId(null);

        try {
          await handler.afterSuccess?.(context);
        } catch {
          // The server action succeeded; a cache refresh can recover later.
        }

        if (completion && !completion.hasRemainingActions) {
          navigate(completion.returnTo, { replace: true });
          return;
        }
      }
    } finally {
      running.current = false;
    }
  }, [navigate, profile, queryClient]);

  useEffect(() => {
    void runPendingActions();
  }, [runPendingActions]);

  const failedAction = findFailedAction(failedActionId);
  if (!failedAction) return null;

  const copy = authActionHandlers[failedAction.type] ?? unknownActionHandler;

  function dismissFailedAction(action: PostAuthAction) {
    const completion = completeAuthAction(action.id);
    setFailedActionId(null);
    if (completion?.hasRemainingActions) {
      void runPendingActions();
    }
  }

  return (
    <div
      role="alert"
      className="fixed bottom-20 left-4 right-4 z-[100] border-2 border-ink bg-bg p-4 shadow-[3px_3px_0_var(--color-ink)] md:left-auto md:right-6 md:bottom-6 md:w-[380px]"
    >
      <p className="font-display font-bold text-ink">{copy.failureTitle}</p>
      <p className="mt-1 text-sm text-ink-soft">{copy.failureMessage}</p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => {
            retryAuthAction(failedAction.id);
            setFailedActionId(null);
            void runPendingActions();
          }}
          className="border border-accent bg-accent px-3 py-2 font-mono text-[11px] font-bold uppercase text-white"
        >
          {copy.retryLabel}
        </button>
        <button
          type="button"
          onClick={() => dismissFailedAction(failedAction)}
          className="border border-ink bg-bg px-3 py-2 font-mono text-[11px] font-bold uppercase text-ink"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
