const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

type AuthProvider = {
  getToken: () => string | null;
  refresh: () => Promise<boolean>;
  logout: () => Promise<void>;
};

let auth: AuthProvider = {
  getToken: () => null,
  refresh: async () => false,
  logout: async () => {},
};

export function configureAuth(provider: AuthProvider) {
  auth = provider;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  params?: Record<string, string | number>;
};

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth: useAuth = true, params } = options;

  let url = `${BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      searchParams.set(key, String(val));
    }
    url += `?${searchParams.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (useAuth) {
    const token = auth.getToken();
    if (!token) throw new ApiError(401, 'Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && useAuth) {
    const refreshed = await auth.refresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${auth.getToken()}`;
      const retry = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
      if (!retry.ok) {
        const err = await retry.json().catch(() => ({ detail: 'Request failed' }));
        throw new ApiError(retry.status, err.detail || 'Request failed');
      }
      return retry.json();
    }
    auth.logout();
    throw new ApiError(401, 'Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new ApiError(res.status, err.detail || 'Request failed');
  }

  return res.json();
}

export const api = {
  // Auth - OTP
  sendOTP: (email: string) =>
    request<OTPSendResponse>('/auth/otp/send', { method: 'POST', body: { email }, auth: false }),

  verifyOTP: (email: string, code: string) =>
    request<OTPVerifyResponse>('/auth/otp/verify', { method: 'POST', body: { email, code }, auth: false }),

  sendUBCVerifyOTP: (email: string) =>
    request<OTPSendResponse>('/auth/ubc-verify/send', { method: 'POST', body: { email } }),

  confirmUBCVerify: (email: string, code: string) =>
    request<UserResponse>('/auth/ubc-verify/confirm', { method: 'POST', body: { email, code } }),

  // Users
  getMe: () => request<UserResponse>('/users/me'),

  onboarding: (data: OnboardingRequest) =>
    request<UserResponse>('/users/onboarding', { method: 'POST', body: data }),

  updateProfile: (data: UpdateProfileRequest) =>
    request<UserResponse>('/users/me', { method: 'PUT', body: data }),

  updateAvailability: (is_available_to_meet: boolean) =>
    request<UserResponse>('/users/me/availability', { method: 'PUT', body: { is_available_to_meet } }),

  getPresignedUpload: (content_type = 'image/jpeg') =>
    request<{ upload_url: string; file_key: string }>('/users/me/presigned-upload', {
      params: { content_type },
    }),

  uploadProfilePhoto: async (localUri: string, contentType = 'image/jpeg'): Promise<UserResponse> => {
    const { upload_url } = await api.getPresignedUpload(contentType);

    const blob = await fetch(localUri).then(r => r.blob());
    const putRes = await fetch(upload_url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });

    if (!putRes.ok) {
      throw new ApiError(putRes.status, 'S3 upload failed');
    }

    return api.getMe();
  },

  getStats: () => request<UserStatsResponse>('/users/me/stats'),

  getNearbyUsers: (radius_km = 5.0) =>
    request<NearbyUserResponse[]>('/users/nearby', { params: { radius_km } }),

  getUser: (userId: string) =>
    request<UserPublicResponse>(`/users/${userId}`),

  // Events
  listEvents: (skip = 0, limit = 20) =>
    request<EventListResponse>('/events', { params: { skip, limit }, auth: false }),

  getEvent: (eventId: string) =>
    request<EventResponse>(`/events/${eventId}`, { auth: false }),

  createEvent: (data: CreateEventRequest) =>
    request<EventResponse>('/events', { method: 'POST', body: data }),

  // Connections
  sendConnectionRequest: (userId: string) =>
    request<ConnectionResponse>(`/connections/request/${userId}`, { method: 'POST' }),

  acceptConnection: (connectionId: string) =>
    request<ConnectionResponse>(`/connections/${connectionId}/accept`, { method: 'PUT' }),

  declineConnection: (connectionId: string) =>
    request<ConnectionResponse>(`/connections/${connectionId}/decline`, { method: 'PUT' }),

  listConnections: () =>
    request<ConnectionListResponse>('/connections'),

  listPendingConnections: () =>
    request<ConnectionListResponse>('/connections/pending'),

  listConnectionMessages: (connectionId: string) =>
    request<ConnectionMessageListResponse>(`/connections/${connectionId}/messages`),
  sendConnectionMessage: (connectionId: string, body: string) =>
    request<ConnectionMessageResponse>(`/connections/${connectionId}/messages`, { method: 'POST', body: { body } }),
  markConnectionMet: (connectionId: string, landmark_name?: string) =>
    request<ConnectionResponse>(
      `/connections/${connectionId}/met${landmark_name ? `?landmark_name=${encodeURIComponent(landmark_name)}` : ''}`,
      { method: 'PUT' },
    ),

  // Matching
  getMatchedUsers: (limit = 10) =>
    request<UserMatchListResponse>('/matching/users', { params: { limit } }),

  getMatchedEvents: (limit = 10) =>
    request<EventMatchListResponse>('/matching/events', { params: { limit } }),

  // Zones
  unlockZone: (zoneId: string) =>
    request<ZoneUnlockResponse>(`/zones/${zoneId}/unlock`, { method: 'POST' }),

  getZoneProgress: () =>
    request<ZoneProgressResponse>('/zones/progress'),
};

// Types matching backend schemas

export interface OTPSendResponse {
  message: string;
  expires_in_seconds: number;
}

export interface OTPVerifyResponse {
  firebase_custom_token: string;
  is_new_user: boolean;
  ubc_verified: boolean;
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

export interface UserPublicResponse {
  id: string;
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
}

export interface NearbyUserResponse {
  user: UserPublicResponse;
  distance_km: number;
}

export interface UserStatsResponse {
  connections_count: number;
  member_since: string;
}

export interface OnboardingRequest {
  preferred_name: string;
  major?: string;
  year_standing?: number;
  faculty?: string;
  interests?: string[];
  bio?: string;
}

export interface UpdateProfileRequest {
  preferred_name?: string;
  major?: string;
  year_standing?: number;
  faculty?: string;
  interests?: string[];
  bio?: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  source: string;
  source_label: 'ubc_official' | 'ams_club' | 'campus_community';
  source_url: string | null;
  external_cta_label: string | null;
  club_name: string | null;
  event_picture_url: string | null;
  vibes: string[];
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  event_date: string | null;
  created_at: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  club_name?: string;
  event_picture_key?: string;
  source_label?: 'ubc_official' | 'ams_club' | 'campus_community';
  source_url?: string;
  external_cta_label?: string;
  vibes?: string[];
  latitude?: number;
  longitude?: number;
  location_name?: string;
  event_date?: string;
}

export interface EventListResponse {
  events: EventResponse[];
  total: number;
}

export interface ConnectionResponse {
  id: string;
  requester: UserPublicResponse;
  receiver: UserPublicResponse;
  status: 'pending' | 'accepted' | 'declined';
  met_at_landmark: string | null;
  created_at: string;
}

export interface ConnectionListResponse {
  connections: ConnectionResponse[];
  total: number;
}

export interface ConnectionMessageResponse {
  id: string;
  connection_id: string;
  sender: UserPublicResponse;
  body: string;
  created_at: string;
}

export interface ConnectionMessageListResponse {
  messages: ConnectionMessageResponse[];
  total: number;
}

export interface MatchedUserResponse {
  user: UserPublicResponse;
  match_score: number;
  match_reason: string;
}

export interface MatchedEventResponse {
  event: EventResponse;
  match_score: number;
  match_reason: string;
}

export interface UserMatchListResponse {
  matches: MatchedUserResponse[];
}

export interface EventMatchListResponse {
  matches: MatchedEventResponse[];
}

export interface ZoneUnlockResponse {
  id: string;
  zone_id: string;
  unlocked_at: string;
}

export interface ZoneProgressResponse {
  unlocks: ZoneUnlockResponse[];
  total_points: number;
}

export { ApiError };
