import { test, expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "../../server/seed";
async function login(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Institutional email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

test("faculty course and marks selectors show only subjects taught by that faculty member", async ({
  page,
}) => {
  for (const [email, allowed, forbidden] of [
    ["faculty@lnmiit.ac.in", ["CS314", "CS301"], ["CS303", "CS305"]],
    ["faculty2@lnmiit.ac.in", ["CS303", "CS305"], ["CS314", "CS301"]],
  ] as const) {
    await login(page, email);
    await page.getByRole("link", { name: "Courses", exact: true }).click();
    for (const code of allowed)
      await expect(page.locator("tbody")).toContainText(code);
    for (const code of forbidden)
      await expect(page.locator("tbody")).not.toContainText(code);
    await page
      .getByRole("link", { name: "Marks & grading", exact: true })
      .click();
    const selector = page.getByLabel("Examination", { exact: true });
    for (const code of allowed) await expect(selector).toContainText(code);
    for (const code of forbidden)
      await expect(selector).not.toContainText(code);
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
  }
});

test("exam office adds and manages TAs and safely deletes unused courses", async ({
  page,
}) => {
  await login(page, "admin@lnmiit.ac.in");
  await page
    .getByRole("link", { name: "Students & faculty", exact: true })
    .click();
  await page
    .getByRole("tab", { name: "Teaching assistants", exact: true })
    .click();
  await page.getByRole("button", { name: "Add TA", exact: true }).click();
  await page.getByLabel("Full name").fill("Office Created TA");
  await page.getByLabel("Institutional email").fill("office-ta@lnmiit.ac.in");
  await page.getByLabel("Initial password").fill(DEMO_PASSWORD);
  await expect(page.getByLabel("Assigned role")).toHaveCount(0);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const ta = page.locator("tr").filter({ hasText: "office-ta@lnmiit.ac.in" });
  await ta.getByRole("button", { name: "Manage TA" }).click();
  await page.getByLabel("Full name").fill("Updated Office TA");
  await page.getByLabel("Account is active").uncheck();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(ta).toContainText("Updated Office TA");
  await expect(ta).toContainText("Inactive");
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await page.getByRole("button", { name: "Add course", exact: true }).click();
  await page.getByLabel("Course code").fill("CS498");
  await page.getByLabel("Course title").fill("Unused Office Course");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const course = page.locator("tr").filter({ hasText: "CS498" });
  await course
    .getByRole("button", { name: "Delete course", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Confirm", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Reason for correction")
    .fill("Delete unused duplicate catalogue entry");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(course).toHaveCount(0);
  await page
    .locator("tr")
    .filter({ hasText: "CS314" })
    .getByRole("button", { name: "Delete course", exact: true })
    .click();
  await page
    .getByLabel("Reason for correction")
    .fill("Attempt deletion of course with history");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "cannot be permanently deleted",
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
});
test("student registration, receipt and responsive navigation", async ({
  page,
}) => {
  await login(page, "student@lnmiit.ac.in");
  await page.getByRole("link", { name: "Registrations", exact: true }).click();
  const card = page
    .locator(".exam-card")
    .filter({ hasText: "Software Engineering" });
  await card.getByRole("button", { name: "Register for examination" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Registration receipt");
  await expect(page.getByRole("dialog")).toContainText("Seat");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".receipt")).toBeVisible();
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.getByRole("button", { name: "Print slip" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Registered", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "My results", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My results", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.screenshot({
    path: ".work/mobile-results.png",
    fullPage: true,
    animations: "disabled",
  });
});
test("faculty saves marks, validates boundaries, generates and publishes private results", async ({
  page,
}) => {
  await login(page, "faculty@lnmiit.ac.in");
  await page.getByRole("link", { name: "Marks & grading" }).click();
  await page.getByLabel("Examination", { exact: true }).selectOption("e-past");
  await page.getByLabel("Marks for Aarav Sharma", { exact: true }).fill("89.5");
  await page.getByRole("button", { name: "Save marks", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Marks saved" }),
  ).toBeVisible();
  await page.getByLabel("Grade label 2", { exact: true }).fill("D");
  await page.getByRole("button", { name: "Save boundaries" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "boundaries" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate grades", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByText("6 grades ready to publish")).toBeVisible();
  await page
    .getByRole("button", { name: "Publish results", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Withdraw publication" }),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Marks for Aarav Sharma", { exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Sign out" }).click();
  await login(page, "student@lnmiit.ac.in");
  await page.getByRole("link", { name: "My results", exact: true }).click();
  await expect(
    page.locator("tr").filter({ hasText: "Mid semester" }),
  ).toContainText("89.5");
});
test("examination administrator creates course and schedule; conflicts are visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, "admin@lnmiit.ac.in");
  await expect(page.locator(".loading")).toHaveCount(0);
  await page.screenshot({
    path: ".work/admin-dashboard.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await page.getByRole("button", { name: "Add course" }).click();
  await page.getByLabel("Course code").fill("CS399");
  await page.getByLabel("Course title").fill("Software Testing");
  await page.getByLabel("Assigned faculty").selectOption("f-1");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByText("Software Testing", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Exam schedules", exact: true }).click();
  await page.getByRole("button", { name: "Create examination" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Course", { exact: true })
    .selectOption({ label: "CS399 · Software Testing" });
  await page
    .getByRole("dialog")
    .getByLabel("Date", { exact: true })
    .fill("2027-05-20");
  await page
    .getByRole("dialog")
    .getByLabel("Venue", { exact: true })
    .fill("Lab 9");
  await page
    .getByLabel("Schedule status", { exact: true })
    .selectOption("PUBLISHED");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Lab 9")).toBeVisible();
  await page.getByRole("button", { name: "Create examination" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Course", { exact: true })
    .selectOption({ label: "CS399 · Software Testing" });
  await page
    .getByRole("dialog")
    .getByLabel("Date", { exact: true })
    .fill("2027-05-20");
  await page
    .getByRole("dialog")
    .getByLabel("Venue", { exact: true })
    .fill("Lab 9");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("alert")).toContainText("Schedule conflict");
});
test("system administrator creates and deactivates an account", async ({
  page,
}) => {
  await login(page, "system@lnmiit.ac.in");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByLabel("Full name").fill("Browser Test User");
  await page
    .getByLabel("Institutional email")
    .fill("browser-test@lnmiit.ac.in");
  await page.getByLabel("Initial password").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const row = page
    .locator("tr")
    .filter({ hasText: "browser-test@lnmiit.ac.in" });
  await row.getByRole("button", { name: "Manage account" }).click();
  await page.getByLabel("Account is active").uncheck();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(row).toContainText("Inactive");
});
test("HOD has read-only reports and no administration controls", async ({
  page,
}) => {
  await login(page, "hod@lnmiit.ac.in");
  await expect(page.getByRole("link", { name: "User accounts" })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "Students & faculty" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Reports & analytics" }).click();
  await expect(
    page.getByRole("heading", { name: "Reports & analytics", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeEnabled();
  await expect(page.getByText("Student-wise report")).toHaveCount(0);
  await page.getByRole("link", { name: "Exam schedules" }).click();
  await expect(
    page.getByRole("button", { name: "Create examination" }),
  ).toHaveCount(0);
});
