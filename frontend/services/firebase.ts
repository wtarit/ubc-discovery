import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface AuthTokens {
  idToken: string;
  refreshToken: string;
}

async function getTokensFromUser(user: FirebaseAuthTypes.User): Promise<AuthTokens> {
  const idToken = await user.getIdToken();
  return { idToken, refreshToken: idToken };
}

export async function signInWithGoogle(): Promise<AuthTokens> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!response.data?.idToken) {
    throw new Error('Google sign-in failed: no ID token');
  }
  const credential = auth.GoogleAuthProvider.credential(response.data.idToken);
  const result = await auth().signInWithCredential(credential);
  return getTokensFromUser(result.user);
}

export async function signInWithCustomToken(customToken: string): Promise<AuthTokens> {
  const result = await auth().signInWithCustomToken(customToken);
  return getTokensFromUser(result.user);
}

export async function refreshIdToken(): Promise<string | null> {
  const user = auth().currentUser;
  if (!user) return null;
  return user.getIdToken(true);
}

export async function logout(): Promise<void> {
  await auth().signOut();
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}
