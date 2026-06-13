import { ApiError } from "~/lib/api";

type AuthError = Error & { code?: string };

export function authErrorMessage(error: unknown): string | null {
  const authError = error as AuthError;
  const code = authError?.code ?? "";
  const message = authError?.message ?? "";
  const normalized = `${code} ${message}`.toLowerCase();

  if (
    normalized.includes("popup-closed-by-user") ||
    normalized.includes("cancelled-popup-request") ||
    normalized.includes("popup cancelled")
  ) {
    return null;
  }
  if (normalized.includes("popup-blocked")) {
    return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
  }
  if (normalized.includes("invalid code")) {
    return "That code is incorrect. Check the email and try again.";
  }
  if (normalized.includes("no valid code") || normalized.includes("expired")) {
    return "That code has expired. Request a new code to continue.";
  }
  if (normalized.includes("too many attempts")) {
    return "Too many incorrect attempts. Request a new code to continue.";
  }
  if (error instanceof ApiError && error.status === 429) {
    return "Too many codes were requested. Wait 15 minutes before trying again.";
  }
  if (
    error instanceof TypeError ||
    normalized.includes("failed to fetch") ||
    normalized.includes("network")
  ) {
    return "We could not reach the sign-in service. Check your connection and try again.";
  }
  if (normalized.includes("firebase web config is missing")) {
    return "Sign-in is not configured for this deployment. Contact the site administrator.";
  }
  if (error instanceof ApiError && error.status >= 500) {
    return "The sign-in service is temporarily unavailable. Try again shortly.";
  }
  return "Sign-in could not be completed. Try again.";
}
