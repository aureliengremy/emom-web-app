import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    // Set guest mode to bypass login redirect
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("emom-guest-mode", "true");
    });
    await page.goto("/");
  });

  test("should display home page", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("EMOM");
  });

  test("should show guest mode banner", async ({ page }) => {
    await expect(page.getByText("Mode invité")).toBeVisible();
  });

  test("should navigate to exercises page", async ({ page }) => {
    await page.click('text="Mes exercices"');
    await expect(page).toHaveURL("/exercises");
    await expect(page.locator("h1")).toContainText("Mes exercices");
  });

  test("should navigate to sessions page", async ({ page }) => {
    await page.click('text="Mes sessions"');
    await expect(page).toHaveURL("/sessions");
  });

  test("should navigate to settings page", async ({ page }) => {
    await page.click('text="Paramètres"');
    await expect(page).toHaveURL("/settings");
  });

  test("should navigate back from exercises to home", async ({ page }) => {
    await page.click('text="Mes exercices"');
    await expect(page).toHaveURL("/exercises");

    // Click back button
    await page.click('[href="/"]');
    await expect(page).toHaveURL("/");
  });
});

test.describe("Exercises Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("emom-guest-mode", "true");
    });
    await page.goto("/exercises");
    // Wait for exercises to load
    await page.waitForSelector("text=/\\d+ exercices?/");
  });

  test("should display exercises grouped by family", async ({ page }) => {
    // Check for family headers (uppercase in the UI)
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("should show exercise count", async ({ page }) => {
    await expect(page.getByText(/\d+ exercices?/)).toBeVisible();
  });

  test("should toggle filter panel", async ({ page }) => {
    // Click filter button (second button in header after back button)
    const filterButton = page.locator("header button").nth(1);
    await filterButton.click();

    // Check filter options are visible
    await expect(page.getByText("Catégorie")).toBeVisible();
    await expect(page.getByText("Tous")).toBeVisible();
  });

  test("should filter exercises by category", async ({ page }) => {
    // Open filters
    const filterButton = page.locator("header button").nth(1);
    await filterButton.click();

    // Wait for filter panel
    await expect(page.getByText("Catégorie")).toBeVisible();

    // Click on Pull filter
    await page.getByText("Pull", { exact: true }).click();

    // Count should be updated (13 Pull exercises)
    await expect(page.getByText("13 exercices")).toBeVisible();
  });

  test("should reset filters", async ({ page }) => {
    // Open filters and apply one
    const filterButton = page.locator("header button").nth(1);
    await filterButton.click();
    await page.getByText("Pull", { exact: true }).click();

    // Verify filter is applied
    await expect(page.getByText("13 exercices")).toBeVisible();

    // Click reset
    await page.getByText("Réinitialiser").click();

    // Should show all exercises again
    await expect(page.getByText("41 exercices")).toBeVisible();
  });
});

test.describe("Login Page", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Connexion")).toBeVisible();
  });

  test("should have email and password inputs", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("should have continue as guest button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Continuer sans compte")).toBeVisible();
  });

  test("should navigate to home in guest mode", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click('text="Continuer sans compte"');
    await expect(page).toHaveURL("/");
  });
});
