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

const AUTH_TEST_MODE = import.meta.env.VITE_AUTH_TEST_MODE === "true";
const TEST_USER_KEY = "ubc-discovery-test-firebase-user";
const TEST_GOOGLE_USER_KEY = "ubc-discovery-test-google-user";
const TEST_GOOGLE_ERROR_KEY = "ubc-discovery-test-google-error";

type TestFirebaseUser = {
  uid: string;
  email: string;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const FIREBASE_CONFIG_MISSING_MESSAGE =
  "Firebase web config is missing. Add VITE_FIREBASE_* values to web/.env.";

export function isFirebaseConfigured() {
  if (AUTH_TEST_MODE) return true;
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

function readTestUser(key = TEST_USER_KEY): TestFirebaseUser | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function asFirebaseUser(user: TestFirebaseUser): User {
  return {
    uid: user.uid,
    email: user.email,
    getIdToken: async () => `mock-token:${user.uid}:${user.email}`,
  } as User;
}

function writeTestUser(user: TestFirebaseUser | null) {
  if (user) {
    window.sessionStorage.setItem(TEST_USER_KEY, JSON.stringify(user));
  } else {
    window.sessionStorage.removeItem(TEST_USER_KEY);
  }
  window.dispatchEvent(new CustomEvent("ubc-test-auth-changed"));
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
  if (AUTH_TEST_MODE) {
    const notify = () => callback(readTestUser() ? asFirebaseUser(readTestUser()!) : null);
    queueMicrotask(notify);
    window.addEventListener("ubc-test-auth-changed", notify);
    return () => window.removeEventListener("ubc-test-auth-changed", notify);
  }
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return () => {};
  }
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function signInWithCustomToken(customToken: string) {
  if (AUTH_TEST_MODE) {
    const [, uid = "otp-user", email = "member@example.com"] = customToken.split(":");
    const user = { uid, email };
    writeTestUser(user);
    return asFirebaseUser(user);
  }
  const result = await firebaseSignInWithCustomToken(getFirebaseAuth(), customToken);
  return result.user;
}

export async function signInWithGoogle() {
  if (AUTH_TEST_MODE) {
    const testError = window.sessionStorage.getItem(TEST_GOOGLE_ERROR_KEY);
    if (testError) {
      const error = new Error(testError) as Error & { code?: string };
      error.code = testError;
      throw error;
    }
    const user = readTestUser(TEST_GOOGLE_USER_KEY) ?? {
      uid: "google-user",
      email: "member@example.com",
    };
    writeTestUser(user);
    return asFirebaseUser(user);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

export async function signOut() {
  if (AUTH_TEST_MODE) {
    writeTestUser(null);
    return;
  }
  if (!isFirebaseConfigured()) return;
  await firebaseSignOut(getFirebaseAuth());
}
