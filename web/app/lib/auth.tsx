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

async function loadProfile() {
  try {
    return await api.users.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const authRequestRef = useRef(0);
  const firebaseConfigError = getFirebaseConfigError();
  const firebaseReady = !firebaseConfigError;

  const refreshProfile = useCallback(async () => {
    if (!uid) return null;
    const requestId = authRequestRef.current;
    const nextProfile = await loadProfile();
    if (authRequestRef.current === requestId) {
      setProfile(nextProfile);
    }
    return nextProfile;
  }, [uid]);

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
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const nextProfile = await loadProfile();
        if (authRequestRef.current !== requestId) return;
        setUid(firebaseUser.uid);
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
    const nextProfile = await loadProfile();
    if (authRequestRef.current === requestId) {
      setUid(user.uid);
      setProfile(nextProfile);
    }
    return nextProfile;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const requestId = authRequestRef.current + 1;
    authRequestRef.current = requestId;
    const user = await firebaseSignInWithGoogle();
    const nextProfile = await loadProfile();
    if (authRequestRef.current === requestId) {
      setUid(user.uid);
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
      setProfile(null);
    }
  }, []);

  const completeOnboarding = useCallback(
    async (data: OnboardingPayload) => {
      if (!uid) throw new Error("Sign in before completing onboarding.");
      const nextProfile = await api.users.onboarding(data);
      setProfile(nextProfile);
      return nextProfile;
    },
    [uid]
  );

  const updateProfile = useCallback(
    async (data: UpdateProfilePayload) => {
      if (!uid) throw new Error("Sign in before updating your profile.");
      const nextProfile = await api.users.update(data);
      setProfile(nextProfile);
      return nextProfile;
    },
    [uid]
  );

  const uploadProfilePhoto = useCallback(
    async (file: File) => {
      if (!uid) throw new Error("Sign in before updating your profile photo.");
      const { upload_url } = await api.users.presignedUpload(
        file.type || "image/jpeg"
      );
      const upload = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "image/jpeg" },
        body: file,
      });
      if (!upload.ok) throw new Error("Profile photo upload failed.");
      return refreshProfile();
    },
    [refreshProfile, uid]
  );

  const value = useMemo(
    () => ({
      loading,
      uid,
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
