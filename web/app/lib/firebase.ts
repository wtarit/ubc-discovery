import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FIREBASE_CONFIG_MISSING_MESSAGE =
  "Firebase web config is missing. Add VITE_FIREBASE_* values to web/.env.";

export function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );
}

export function getFirebaseConfigError() {
  return isFirebaseConfigured() ? null : FIREBASE_CONFIG_MISSING_MESSAGE;
}

function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase auth is only available in the browser.");
  }
  const configError = getFirebaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function watchFirebaseAuth(callback: (user: User | null) => void) {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return () => {};
  }
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithCustomToken(customToken: string) {
  const result = await firebaseSignInWithCustomToken(getFirebaseAuth(), customToken);
  return result.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

export async function signOut() {
  if (!isFirebaseConfigured()) return;
  await firebaseSignOut(getFirebaseAuth());
}
