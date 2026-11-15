import { test, expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "../../server/seed";
async function login(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Institutional email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}
test("Password visibility is accessible, masked by default and never submits the form", async ({
  page,
}) => {
  await page.goto("/");
  const field = page.getByLabel("Password", { exact: true });
  await field.fill(DEMO_PASSWORD);
  await expect(field).toHaveAttribute("type", "password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(field).toHaveAttribute("type", "text");
  await expect(field).toHaveValue(DEMO_PASSWORD);
  await expect(
    page.getByRole("button", { name: "Hide password" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(field).toHaveAttribute("type", "password");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: ".work/login-review.png",
    fullPage: true,
    animations: "disabled",
  });
});
test("Office cancellation needs a reason; student sees no cancellation or restoration action", async ({
  page,
}) => {
  await login(page, "admin@examease.local");
  await page.getByRole("link", { name: "Registrations", exact: true }).click();
  const row = page
    .locator("tr")
    .filter({ hasText: "24UCC101" })
    .filter({ hasText: "CS301" });
  await row.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Confirm", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Reason for correction")
    .fill("Correct an incorrectly selected examination");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(row).toContainText("Cancelled");
  await page.getByRole("button", { name: "Sign out" }).click();
  await login(page, "student@examease.local");
  await page.getByRole("link", { name: "Registrations", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true }),
  ).toHaveCount(0);
  const card = page
    .locator(".exam-card")
    .filter({ hasText: "Database Management Systems" });
  await expect(
    card.getByRole("button", { name: "Contact examination office" }),
  ).toBeDisabled();
  await page.screenshot({
    path: ".work/registrations-review.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.request.post("/api/auth/logout");
  await page.request.post("/api/auth/login", {
    data: { email: "admin@examease.local", password: DEMO_PASSWORD },
  });
  await page.request.post("/api/registrations", {
    data: { examScheduleId: "e-2", studentId: "s-1" },
  });
});
test("Unsaved marks and boundaries survive independent saves; navigation and blank corrections are guarded", async ({
  page,
}) => {
  await login(page, "faculty@examease.local");
  await page.getByRole("link", { name: "Marks & grading" }).click();
  await page.getByLabel("Examination", { exact: true }).selectOption("e-past");
  const mark = page.getByLabel("Marks for Aarav Sharma", { exact: true });
  await mark.fill("89");
  await page.getByLabel("Grade label 2", { exact: true }).fill("D+");
  await page.getByRole("button", { name: "Save marks", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Marks saved" }),
  ).toBeVisible();
  await expect(page.getByLabel("Grade label 2", { exact: true })).toHaveValue(
    "D+",
  );
  await mark.fill("90");
  await page.getByRole("button", { name: "Save boundaries" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "boundaries" }),
  ).toBeVisible();
  await expect(mark).toHaveValue("90");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("link", { name: "Courses", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Marks & grading", exact: true }),
  ).toBeVisible();
  await expect(mark).toHaveValue("90");
  await mark.fill("");
  await expect(mark).toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("button", { name: "Save marks", exact: true }),
  ).toBeDisabled();
  await mark.fill("88");
  await page.getByRole("button", { name: "Save marks", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Marks saved" }),
  ).toBeVisible();
});
test("A failed report request cannot display the previous student", async ({
  page,
}) => {
  await login(page, "admin@examease.local");
  await page.getByRole("link", { name: "Reports & analytics" }).click();
  const selector = page.getByLabel("Select student for report");
  await selector.selectOption("s-1");
  const panel = page.locator(".panel").filter({
    has: page.getByRole("heading", { name: "Student-wise report" }),
  });
  await expect(panel.locator("tbody tr")).not.toHaveCount(0);
  await page.route("**/api/reports/student/s-2", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Report temporarily unavailable." }),
    }),
  );
  await selector.selectOption("s-2");
  await expect(panel.getByRole("alert")).toContainText(
    "Report temporarily unavailable",
  );
  await expect(panel.locator("tbody tr")).toHaveCount(0);
});
test("System administrator password input can be revealed and own role/deactivation controls are locked", async ({
  page,
}) => {
  await login(page, "system@examease.local");
  const ownRow = page
    .locator("tr")
    .filter({ hasText: "system@examease.local" });
  await ownRow.getByRole("button", { name: "Manage account" }).click();
  await expect(page.getByLabel("Assigned role")).toBeDisabled();
  await expect(page.getByLabel("Account is active")).toBeDisabled();
  await page
    .getByLabel("New password (optional)")
    .fill("TemporaryTestPassword");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("New password (optional)")).toHaveAttribute(
    "type",
    "text",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
});
test("A new student without an academic profile gets useful guidance", async ({
  page,
}) => {
  await page.request.post("/api/auth/login", {
    data: { email: "system@examease.local", password: DEMO_PASSWORD },
  });
  const created = await page.request.post("/api/users", {
    data: {
      email: "unlinked-student@examease.local",
      name: "Unlinked Student",
      password: DEMO_PASSWORD,
      role: "STUDENT",
      department: "Computer Science",
      active: true,
    },
  });
  expect(created.status()).toBe(201);
  await page.request.post("/api/auth/logout");
  await login(page, "unlinked-student@examease.local");
  await page.getByRole("link", { name: "My results", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Your student profile has not been created. Contact the examination office.",
  );
});
