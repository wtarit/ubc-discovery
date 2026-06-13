import { expect, test } from "@playwright/test";
import { mockApi, setAuthenticatedUser } from "./support/auth";

test("restores an interrupted draft only for the same Firebase UID", async ({ page }) => {
  await mockApi(page, { profile: null });
  await setAuthenticatedUser(page, {
    uid: "account-a",
    email: "a@example.com",
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "ubc-discovery:onboarding-draft:account-a",
      JSON.stringify({ preferred_name: "Account A Draft" })
    );
  });
  await page.goto("/welcome/name");
  await expect(page.locator("input:visible")).toHaveValue("Account A Draft");

  await page.evaluate(() => {
    window.sessionStorage.setItem(
      "ubc-discovery-test-firebase-user",
      JSON.stringify({ uid: "account-b", email: "b@example.com" })
    );
    window.dispatchEvent(new CustomEvent("ubc-test-auth-changed"));
  });
  await page.reload();
  await expect(page.locator("input:visible")).toHaveValue("");
});

test("discards a malformed account draft", async ({ page }) => {
  await mockApi(page, { profile: null });
  await setAuthenticatedUser(page, {
    uid: "account-a",
    email: "a@example.com",
  });
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "ubc-discovery:onboarding-draft:account-a",
      JSON.stringify({ preferred_name: 42 })
    );
  });
  await page.goto("/welcome/name");

  await expect(page.locator("input:visible")).toHaveValue("");
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.localStorage.getItem(
          "ubc-discovery:onboarding-draft:account-a"
        )
      )
    )
    .toBeNull();
});
