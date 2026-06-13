const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  source: string;
  source_label: string;
  source_url: string | null;
  external_cta_label: string | null;
  club_name: string | null;
  event_picture_url: string | null;
  vibes: string[];
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  event_date: string | null;
  event_end_date: string | null;
  created_at: string;
}

export interface EventListResponse {
  events: ApiEvent[];
  total: number;
}

export interface UserResponse {
  id: string;
  email: string;
  preferred_name: string;
  major: string | null;
  year_standing: number | null;
  faculty: string | null;
  interests: string[] | null;
  bio: string | null;
  profile_picture_url: string | null;
  is_available_to_meet: boolean;
  ubc_verified: boolean;
  connections_count: number;
  created_at: string;
}

export interface SavedEventResponse {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
}

export interface SavedEventWithEventResponse extends SavedEventResponse {
  event: ApiEvent;
}

export interface EventRatingResponse {
  id: string;
  user_id: string;
  event_id: string;
  stars: number;
  strong_vibes: string[];
  note: string | null;
  created_at: string;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = body.detail;
    const message =
      typeof detail === "object" && detail
        ? detail.message
        : detail ?? `API error ${res.status}`;
    const code =
      typeof detail === "object" && detail ? detail.code : body.code;
    throw new ApiError(res.status, message, code);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  events: {
    list: (skip = 0, limit = 50) =>
      apiFetch<EventListResponse>(`/events?skip=${skip}&limit=${limit}`),
    get: (id: string) => apiFetch<ApiEvent>(`/events/${id}`),
  },
  auth: {
    sendOtp: (email: string) =>
      apiFetch<{ message: string; expires_in_seconds: number }>(
        "/auth/otp/send",
        { method: "POST", body: JSON.stringify({ email }) }
      ),
    verifyOtp: (email: string, code: string) =>
      apiFetch<{
        firebase_custom_token: string;
        is_new_user: boolean;
        ubc_verified: boolean;
      }>("/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      }),
  },
  users: {
    me: (token: string) => apiFetch<UserResponse>("/users/me", {}, token),
    onboarding: (
      token: string,
      data: {
        preferred_name: string;
        major?: string;
        year_standing?: number;
        faculty?: string;
        interests?: string[];
      }
    ) =>
      apiFetch<UserResponse>(
        "/users/onboarding",
        { method: "POST", body: JSON.stringify(data) },
        token
      ),
    update: (
      token: string,
      data: {
        preferred_name?: string;
        major?: string;
        year_standing?: number;
        faculty?: string;
        interests?: string[];
      }
    ) =>
      apiFetch<UserResponse>(
        "/users/me",
        { method: "PUT", body: JSON.stringify(data) },
        token
      ),
    presignedUpload: (token: string, contentType = "image/jpeg") =>
      apiFetch<{ upload_url: string; file_key: string }>(
        `/users/me/presigned-upload?content_type=${encodeURIComponent(contentType)}`,
        {},
        token
      ),
  },
  saved: {
    list: (token: string, skip = 0, limit = 100) =>
      apiFetch<{ saved_events: SavedEventWithEventResponse[]; total: number }>(
        `/saved-events?skip=${skip}&limit=${limit}`,
        {},
        token
      ),
    save: (token: string, eventId: string) =>
      apiFetch<SavedEventResponse>(
        `/saved-events/${eventId}`,
        { method: "POST" },
        token
      ),
    unsave: (token: string, eventId: string) =>
      apiFetch<void>(`/saved-events/${eventId}`, { method: "DELETE" }, token),
    status: (token: string, eventId: string) =>
      apiFetch<{ saved: boolean }>(
        `/saved-events/${eventId}/status`,
        {},
        token
      ),
  },
  ratings: {
    list: (token: string) =>
      apiFetch<{ ratings: EventRatingResponse[]; total: number }>(
        "/ratings",
        {},
        token
      ),
    rate: (
      token: string,
      eventId: string,
      data: { stars: number; strong_vibes?: string[]; note?: string }
    ) =>
      apiFetch<EventRatingResponse>(
        `/ratings/${eventId}`,
        { method: "POST", body: JSON.stringify(data) },
        token
      ),
    get: (token: string, eventId: string) =>
      apiFetch<EventRatingResponse>(`/ratings/${eventId}`, {}, token),
  },
};
