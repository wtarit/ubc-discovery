import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';

function ensureApp() {
  if (getApps().length === 0) {
    initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    });
  }
  return getAuth(getApp());
}

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
}

async function getTokensFromUser(user: import('firebase/auth').User): Promise<AuthTokens> {
  const idToken = await user.getIdToken();
  return { idToken, refreshToken: idToken };
}

export async function signInWithGoogle(): Promise<AuthTokens> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(ensureApp(), provider);
  return getTokensFromUser(result.user);
}

export async function signInWithCustomToken(customToken: string): Promise<AuthTokens> {
  const result = await firebaseSignInWithCustomToken(ensureApp(), customToken);
  return getTokensFromUser(result.user);
}

export async function refreshIdToken(): Promise<string | null> {
  const user = ensureApp().currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

export async function logout(): Promise<void> {
  await signOut(ensureApp());
}

export function getCurrentUser() {
  return ensureApp().currentUser;
}
