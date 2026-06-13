const RETURN_PATH_KEY = "ubc-discovery-auth-return-path";

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
