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
