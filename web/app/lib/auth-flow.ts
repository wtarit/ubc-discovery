const RETURN_PATH_KEY = "ubc-discovery-auth-return-path";
const PENDING_SAVE_KEY = "ubc-discovery-pending-save";

export type PendingSaveAction = {
  eventId: string;
  returnPath: string;
  status: "pending" | "failed";
};

export function validateReturnPath(candidate: string | null | undefined) {
  if (!candidate || typeof window === "undefined") return null;
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return null;
  try {
    const url = new URL(candidate, window.location.origin);
    if (url.origin !== window.location.origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function rememberReturnPath(candidate: string | null | undefined) {
  const path = validateReturnPath(candidate);
  if (path) window.sessionStorage.setItem(RETURN_PATH_KEY, path);
  return path;
}

export function peekReturnPath() {
  if (typeof window === "undefined") return "/";
  return validateReturnPath(window.sessionStorage.getItem(RETURN_PATH_KEY)) ?? "/";
}

export function consumeReturnPath() {
  const path = peekReturnPath();
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RETURN_PATH_KEY);
  }
  return path;
}

export function storePendingSave(eventId: string) {
  if (typeof window === "undefined") return;
  const action: PendingSaveAction = {
    eventId,
    returnPath: `/events/${encodeURIComponent(eventId)}`,
    status: "pending",
  };
  window.sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify(action));
  rememberReturnPath(action.returnPath);
}

export function readPendingSave(): PendingSaveAction | null {
  if (typeof window === "undefined") return null;
  try {
    const action = JSON.parse(
      window.sessionStorage.getItem(PENDING_SAVE_KEY) ?? "null"
    ) as PendingSaveAction | null;
    if (
      !action ||
      typeof action.eventId !== "string" ||
      !validateReturnPath(action.returnPath) ||
      !["pending", "failed"].includes(action.status)
    ) {
      return null;
    }
    return action;
  } catch {
    return null;
  }
}

export function markPendingSaveFailed() {
  const action = readPendingSave();
  if (!action) return;
  window.sessionStorage.setItem(
    PENDING_SAVE_KEY,
    JSON.stringify({ ...action, status: "failed" })
  );
}

export function retryPendingSave() {
  const action = readPendingSave();
  if (!action) return;
  window.sessionStorage.setItem(
    PENDING_SAVE_KEY,
    JSON.stringify({ ...action, status: "pending" })
  );
}

export function clearPendingSave() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(PENDING_SAVE_KEY);
  }
}
