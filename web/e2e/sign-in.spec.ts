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

test("normalizes email and submits both forms with Enter", async ({ page }) => {
  let sentEmail = "";
  let verifiedCode = "";
  await mockApi(page);
  page.on("request", (request) => {
    if (request.url().endsWith("/auth/otp/send")) {
      sentEmail = request.postDataJSON().email;
    }
    if (request.url().endsWith("/auth/otp/verify")) {
      verifiedCode = request.postDataJSON().code;
    }
  });
  await page.goto("/sign-in");

  const email = page.locator("[data-auth-email]:visible");
  await email.fill("  Person@Example.COM ");
  await email.press("Enter");
  await expect(page.locator("[data-auth-code]:visible")).toBeFocused();
  expect(sentEmail).toBe("person@example.com");

  const code = page.locator("[data-auth-code]:visible");
  await code.fill("12ab3456");
  await expect(code).toHaveValue("123456");
  await code.press("Enter");
  expect(verifiedCode).toBe("123456");
});

test("uses OTP autocomplete and numeric keyboard attributes", async ({ page }) => {
  await mockApi(page);
  await page.goto("/sign-in");
  await page.locator("[data-auth-email]:visible").fill("person@example.com");
  await page.locator("[data-auth-email]:visible").press("Enter");

  const code = page.locator("[data-auth-code]:visible");
  await expect(code).toHaveAttribute("autocomplete", "one-time-code");
  await expect(code).toHaveAttribute("inputmode", "numeric");
  await expect(code).toHaveAttribute("pattern", "[0-9]{6}");
});

test("presents actionable OTP and rate-limit errors", async ({ page }) => {
  await mockApi(page, {
    verifyError: { status: 400, detail: "Invalid code." },
  });
  await page.goto("/sign-in");
  await page.locator("[data-auth-email]:visible").fill("person@example.com");
  await page.locator("[data-auth-email]:visible").press("Enter");
  await page.locator("[data-auth-code]:visible").fill("000000");
  await page.locator("[data-auth-code]:visible").press("Enter");
  await expect(page.getByText(/code is incorrect/i).filter({ visible: true })).toBeVisible();

  await page.unrouteAll();
  await mockApi(page, {
    sendError: { status: 429, detail: "Too many requests." },
  });
  await page.locator("button:visible", { hasText: /change email/i }).click();
  await page.locator("[data-auth-email]:visible").press("Enter");
  await expect(page.getByText(/wait 15 minutes/i).filter({ visible: true })).toBeVisible();
});

test("treats Google cancellation as non-fatal and explains blocked popups", async ({ page }) => {
  await mockApi(page);
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      "ubc-discovery-test-google-error",
      "auth/popup-closed-by-user"
    );
  });
  await page.goto("/sign-in");
  await page.getByRole("button", { name: /continue with google/i }).click();
  await expect(page.locator("p.text-\\[12px\\]:visible")).toHaveCount(0);

  await page.evaluate(() => {
    window.sessionStorage.setItem(
      "ubc-discovery-test-google-error",
      "auth/popup-blocked"
    );
  });
  await page.getByRole("button", { name: /continue with google/i }).click();
  await expect(page.getByText(/allow pop-ups/i).filter({ visible: true })).toBeVisible();
});
