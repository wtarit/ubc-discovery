import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, type UserResponse } from "~/lib/api";
import {
  getFirebaseConfigError,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  watchFirebaseAuth,
} from "~/lib/firebase";

type OnboardingPayload = {
  preferred_name: string;
  major?: string;
  year_standing?: number;
  faculty?: string;
  interests?: string[];
  bio?: string;
};

type UpdateProfilePayload = Partial<OnboardingPayload>;

type AuthContextValue = {
  loading: boolean;
  uid: string | null;
  token: string | null;
  profile: UserResponse | null;
  firebaseReady: boolean;
  firebaseConfigError: string | null;
  signInWithOtpToken: (customToken: string) => Promise<UserResponse | null>;
  signInWithGoogle: () => Promise<UserResponse | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserResponse | null>;
  completeOnboarding: (data: OnboardingPayload) => Promise<UserResponse>;
  updateProfile: (data: UpdateProfilePayload) => Promise<UserResponse>;
  uploadProfilePhoto: (file: File) => Promise<UserResponse | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(token: string) {
  try {
    return await api.users.me(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const authRequestRef = useRef(0);
  const firebaseConfigError = getFirebaseConfigError();
  const firebaseReady = !firebaseConfigError;

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const requestId = authRequestRef.current;
    const nextProfile = await loadProfile(token);
    if (authRequestRef.current === requestId) {
      setProfile(nextProfile);
    }
    return nextProfile;
  }, [token]);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }

    const unsubscribe = watchFirebaseAuth(async (firebaseUser) => {
      const requestId = authRequestRef.current + 1;
      authRequestRef.current = requestId;

      if (!firebaseUser) {
        setUid(null);
        setToken(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const idToken = await firebaseUser.getIdToken();
        const nextProfile = await loadProfile(idToken);
        if (authRequestRef.current !== requestId) return;
        setUid(firebaseUser.uid);
        setToken(idToken);
        setProfile(nextProfile);
      } finally {
        if (authRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [firebaseReady]);

  const signInWithOtpToken = useCallback(async (customToken: string) => {
    const requestId = authRequestRef.current + 1;
    authRequestRef.current = requestId;
    const user = await firebaseSignInWithCustomToken(customToken);
    const idToken = await user.getIdToken();
    const nextProfile = await loadProfile(idToken);
    if (authRequestRef.current === requestId) {
      setUid(user.uid);
      setToken(idToken);
      setProfile(nextProfile);
    }
    return nextProfile;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const requestId = authRequestRef.current + 1;
    authRequestRef.current = requestId;
    const user = await firebaseSignInWithGoogle();
    const idToken = await user.getIdToken();
    const nextProfile = await loadProfile(idToken);
    if (authRequestRef.current === requestId) {
      setUid(user.uid);
      setToken(idToken);
      setProfile(nextProfile);
    }
    return nextProfile;
  }, []);

  const signOut = useCallback(async () => {
    const requestId = authRequestRef.current + 1;
    authRequestRef.current = requestId;
    await firebaseSignOut();
    if (authRequestRef.current === requestId) {
      setUid(null);
      setToken(null);
      setProfile(null);
    }
  }, []);

  const completeOnboarding = useCallback(
    async (data: OnboardingPayload) => {
      if (!token) throw new Error("Sign in before completing onboarding.");
      const nextProfile = await api.users.onboarding(token, data);
      setProfile(nextProfile);
      return nextProfile;
    },
    [token]
  );

  const updateProfile = useCallback(
    async (data: UpdateProfilePayload) => {
      if (!token) throw new Error("Sign in before updating your profile.");
      const nextProfile = await api.users.update(token, data);
      setProfile(nextProfile);
      return nextProfile;
    },
    [token]
  );

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      if (!token) throw new Error("Sign in before updating your profile photo.");
      const { upload_url } = await api.users.presignedUpload(token, file.type || "image/jpeg");
      const upload = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!upload.ok) throw new Error("Profile photo upload failed.");
      return refreshProfile();
    },
    [refreshProfile, token]
  );

  const value = useMemo(
    () => ({
      loading,
      uid,
      token,
      profile,
      firebaseReady,
      firebaseConfigError,
      signInWithOtpToken,
      signInWithGoogle,
      signOut,
      refreshProfile,
      completeOnboarding,
      updateProfile,
      uploadProfilePhoto,
    }),
    [
      completeOnboarding,
      firebaseConfigError,
      firebaseReady,
      loading,
      profile,
      refreshProfile,
      signInWithGoogle,
      signInWithOtpToken,
      signOut,
      token,
      uid,
      updateProfile,
      uploadProfilePhoto,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
