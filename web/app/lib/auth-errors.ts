import { ApiError } from "~/lib/api";
import { FIREBASE_CONFIG_MISSING_MESSAGE } from "~/lib/firebase";

type AuthError = Error & { code?: string };

export function authErrorMessage(error: unknown): string | null {
  const authError = error as AuthError;

  if (error instanceof ApiError) {
    switch (error.code) {
      case "OTP_INVALID":
        return "That code is incorrect. Check the email and try again.";
      case "OTP_EXPIRED":
        return "That code has expired. Request a new code to continue.";
      case "OTP_TOO_MANY_ATTEMPTS":
        return "Too many incorrect attempts. Request a new code to continue.";
      case "OTP_RATE_LIMITED":
        return "Too many codes were requested. Wait 15 minutes before trying again.";
      case "OTP_DELIVERY_FAILED":
        return "The sign-in email could not be sent. Try again shortly.";
      default:
        return error.status >= 500
          ? "The sign-in service is temporarily unavailable. Try again shortly."
          : "Sign-in could not be completed. Try again.";
    }
  }

  switch (authError?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return null;
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
  }

  if (error instanceof TypeError) {
    return "We could not reach the sign-in service. Check your connection and try again.";
  }
  if (authError?.message === FIREBASE_CONFIG_MISSING_MESSAGE) {
    return "Sign-in is not configured for this deployment. Contact the site administrator.";
  }
  return "Sign-in could not be completed. Try again.";
}
