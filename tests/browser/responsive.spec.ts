import { test, expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "../../server/seed";

async function login(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Institutional email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator(".main-shell h1")).toBeVisible();
}
async function fits(page: Page) {
  await expect(page.locator(".loading")).toHaveCount(0);
  const dimensions = await page.evaluate(() => ({
    width: innerWidth,
    page: document.documentElement.scrollWidth,
  }));
  expect(
    dimensions.page,
    `Page must fit ${dimensions.width}px; only data tables may scroll horizontally`,
  ).toBeLessThanOrEqual(dimensions.width + 1);
  for (const selector of [
    ".page-heading",
    ".tabs",
    ".exam-selector",
    "dialog[open]",
  ]) {
    for (const element of await page.locator(selector).all()) {
      const box = await element.boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width).toBeLessThanOrEqual(dimensions.width + 1);
      }
    }
  }
}

for (const viewport of [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 844, height: 390 },
  // Equivalent CSS viewport for a 1280px browser at 200% zoom.
  { width: 640, height: 450 },
])
  test(`responsive role screens at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await fits(page);
    if (viewport.width < 950) {
      expect(
        await page
          .getByLabel("Institutional email")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(16);
    }
    await login(page, "admin@lnmiit.ac.in");
    for (const route of [
      "home",
      "courses",
      "schedule",
      "registrations",
      "records",
      "duties",
      "publication",
      "reports",
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.locator(".main-shell h1")).toBeVisible();
      await fits(page);
      if (route === "home" && [320, 768, 1440].includes(viewport.width))
        await page.screenshot({
          path: `.work/responsive-home-${viewport.width}.png`,
          fullPage: true,
        });
      if (route === "records") {
        for (const name of [
          "Teaching assistants",
          "Course enrollments",
          "Faculty",
          "Students",
        ]) {
          await page.getByRole("tab", { name, exact: true }).click();
          await fits(page);
        }
      }
    }
    await page.goto("/#courses");
    await page.getByRole("button", { name: "Add course", exact: true }).click();
    await fits(page);
    const modal = page.getByRole("dialog");
    const modalBox = await modal.boundingBox();
    expect(modalBox!.height).toBeLessThanOrEqual(viewport.height);
    await modal
      .getByRole("button", { name: "Save changes", exact: true })
      .scrollIntoViewIfNeeded();
    const saveBox = await modal
      .getByRole("button", { name: "Save changes", exact: true })
      .boundingBox();
    expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(
      viewport.height + 1,
    );

    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await page.request.post("/api/auth/logout");
    for (const [email, routes] of [
      ["faculty@lnmiit.ac.in", ["marks", "reports"]],
      ["student@lnmiit.ac.in", ["registrations", "results"]],
      ["ta1@lnmiit.ac.in", ["duties"]],
      ["system@lnmiit.ac.in", ["accounts", "audit"]],
      ["hod@lnmiit.ac.in", ["reports"]],
    ] as const) {
      await login(page, email);
      for (const route of routes) {
        await page.goto(`/#${route}`);
        await expect(page.locator(".main-shell h1")).toBeVisible();
        await fits(page);
        if (route === "marks" && viewport.width === 390)
          await page.screenshot({
            path: ".work/responsive-marks-phone.png",
            fullPage: true,
          });
      }
      await page.request.post("/api/auth/logout");
    }
  });

test("navigation remains reachable on short screens and tablet drawers support keyboard dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 390 });
  await login(page, "admin@lnmiit.ac.in");
  for (const viewport of [
    { width: 320, height: 320 },
    { width: 844, height: 390 },
    { width: 1024, height: 360 },
  ]) {
    await page.setViewportSize(viewport);
    const trigger = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    const drawer = viewport.width < 950;
    if (drawer) {
      await trigger.click();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(".main-shell")).toHaveAttribute("inert", "");
    }
    await page
      .getByRole("button", { name: "Sign out", exact: true })
      .scrollIntoViewIfNeeded();
    const box = await page
      .getByRole("button", { name: "Sign out", exact: true })
      .boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
    if (drawer) {
      await page.keyboard.press("Escape");
      await expect(page.locator(".sidebar")).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
    }
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeHidden();
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(page.locator(".sidebar")).toBeHidden();
  await page.setViewportSize({ width: 320, height: 568 });
  const region = page.getByRole("region", { name: /Course, Department/ });
  await expect(page.locator(".table-scroll-hint")).toBeVisible();
  await region.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => region.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0);
  await fits(page);
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const close = page.getByRole("button", {
    name: "Close navigation",
    exact: true,
  });
  const logout = page.getByRole("button", { name: "Sign out", exact: true });
  await logout.focus();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(logout).toBeFocused();
  await logout.click();
  await expect(page.getByLabel("Institutional email")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
});

test("touch devices retain readable form fonts and large password/sign-in targets", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:3002",
    hasTouch: true,
    viewport: { width: 1024, height: 768 },
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    expect(
      await page.evaluate(() => matchMedia("(pointer:coarse)").matches),
    ).toBe(true);
    expect(
      await page
        .getByLabel("Institutional email")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16);
    for (const name of ["Show password", "Sign in"]) {
      const box = await page
        .getByRole("button", { name, exact: true })
        .boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await fits(page);
  } finally {
    await context.close();
  }
});
