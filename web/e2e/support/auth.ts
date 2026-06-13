import type { Page } from "@playwright/test";

export type MockProfile = {
  id: string;
  email: string;
  preferred_name: string;
  major: string | null;
  year_standing: number | null;
  faculty: string | null;
  interests: string[];
  bio: string | null;
  profile_picture_url: string | null;
  is_available_to_meet: boolean;
  ubc_verified: boolean;
  connections_count: number;
  created_at: string;
};

export const existingProfile: MockProfile = {
  id: "member-1",
  email: "member@example.com",
  preferred_name: "Taylor",
  major: "Computer Science",
  year_standing: 3,
  faculty: "Science",
  interests: ["music", "outdoors", "food"],
  bio: null,
  profile_picture_url: null,
  is_available_to_meet: false,
  ubc_verified: false,
  connections_count: 0,
  created_at: "2026-01-01T00:00:00Z",
};

export async function mockApi(
  page: Page,
  options: {
    profile?: MockProfile | null;
    otpExpirySeconds?: number;
    sendError?: { status: number; detail: string };
    verifyError?: { status: number; detail: string };
  } = {}
) {
  const profile = options.profile === undefined ? null : options.profile;

  await page.route("http://api.test/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/users/me") {
      await route.fulfill({
        status: profile ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(profile ?? { detail: "User profile not found." }),
      });
      return;
    }
    if (url.pathname === "/auth/otp/send") {
      if (options.sendError) {
        await route.fulfill({
          status: options.sendError.status,
          contentType: "application/json",
          body: JSON.stringify({ detail: options.sendError.detail }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "sent",
          expires_in_seconds: options.otpExpirySeconds ?? 600,
        }),
      });
      return;
    }
    if (url.pathname === "/auth/otp/verify") {
      if (options.verifyError) {
        await route.fulfill({
          status: options.verifyError.status,
          contentType: "application/json",
          body: JSON.stringify({ detail: options.verifyError.detail }),
        });
        return;
      }
      const body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          firebase_custom_token: `mock-token:otp-user:${body.email}`,
          is_new_user: !profile,
          ubc_verified: false,
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ events: [], total: 0 }),
    });
  });
}

export async function setAuthenticatedUser(
  page: Page,
  user = { uid: "existing-uid", email: "member@example.com" }
) {
  await page.addInitScript((value) => {
    window.sessionStorage.setItem(
      "ubc-discovery-test-firebase-user",
      JSON.stringify(value)
    );
  }, user);
}
