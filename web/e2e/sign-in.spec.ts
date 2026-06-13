import { expect, test } from "@playwright/test";
import { existingProfile, mockApi, setAuthenticatedUser } from "./support/auth";

test("shows both sign-in methods to a signed-out visitor", async ({ page }) => {
  await mockApi(page);
  await page.goto("/sign-in");

  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
  await expect(page.locator('input[type="email"]:visible')).toBeVisible();
});

test("restores an existing Firebase session", async ({ page }) => {
  await mockApi(page, { profile: existingProfile });
  await setAuthenticatedUser(page);
  await page.goto("/profile");

  await expect(page.getByText("Taylor", { exact: true })).toHaveCount(2);
});

test("focuses the verification state after sending a code", async ({ page }) => {
  await mockApi(page);
  await page.goto("/sign-in");

  await page.locator('input[type="email"]:visible').fill("person@example.com");
  await page.getByRole("button", { name: /send sign-in code|continue with email/i }).click();

  await expect(page.locator("p:visible", { hasText: "code sent to" })).toBeVisible();
  await expect(page.locator("button:visible", { hasText: /continue with google/i })).toHaveCount(0);
  await expect(page.locator("button:visible", { hasText: /change email/i })).toBeVisible();
  await expect(page.locator('input[placeholder="123456"]:visible')).toBeVisible();
});

test("expires codes and keeps resend on cooldown", async ({ page }) => {
  await mockApi(page, { otpExpirySeconds: 1 });
  await page.goto("/sign-in");
  await page.locator('input[type="email"]:visible').fill("person@example.com");
  await page.getByRole("button", { name: /send sign-in code|continue with email/i }).click();

  await expect(page.locator("button:visible", { hasText: /resend.*30s/i })).toBeDisabled();
  await expect(page.getByText(/code has expired/i).filter({ visible: true })).toBeVisible({
    timeout: 3_000,
  });
  await expect(page.locator("button:visible", { hasText: /^verify/i })).toBeDisabled();
});
