import { test, expect, type Page } from "@playwright/test";
import { DEMO_PASSWORD } from "../../server/seed";

async function login(page: Page, email: string) {
  await page.goto("/");
  await page.getByLabel("Institutional email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
}

test("office assigns TA and faculty duties; removal needs a reason; TA roster and printing preserve privacy", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, "admin@examease.local");
  await page.getByRole("link", { name: "Exam hall duties" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Examination hall staffing",
      exact: true,
    }),
  ).toBeVisible();
  const assign = async (label: string) => {
    await page
      .getByRole("button", { name: "Assign duty", exact: true })
      .click();
    await page.getByLabel("Examination", { exact: true }).selectOption("e-2");
    await page
      .getByLabel("Staff member", { exact: true })
      .selectOption({ label });
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Assign duty", exact: true })
      .click();
  };
  await assign("Aditi Joshi · Teaching assistant");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await assign("Dr. Rohan Mehta · Faculty invigilator");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const taRow = page.locator("tr").filter({ hasText: "ta1@examease.local" });
  await expect(taRow).toContainText("Teaching assistant");
  const facultyRow = page
    .locator("tr")
    .filter({ hasText: "faculty2@examease.local" });
  await expect(facultyRow).toContainText("Faculty invigilator");
  await page.screenshot({
    path: ".work/hall-staffing-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await taRow.getByRole("button", { name: "Remove duty" }).click();
  await expect(
    page.getByRole("button", { name: "Confirm", exact: true }),
  ).toBeDisabled();
  await page
    .getByLabel("Reason")
    .fill("Temporary duty removed by the examination office");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(taRow).toHaveCount(0);
  await page.getByLabel("Duty status").selectOption("CANCELLED");
  await expect(taRow).toContainText("Cancelled");
  await page.getByLabel("Duty status").selectOption("ASSIGNED");
  await assign("Aditi Joshi · Teaching assistant");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();

  await login(page, "ta1@examease.local");
  await expect(
    page.getByRole("heading", {
      name: "My examination hall duties",
      exact: true,
    }),
  ).toBeVisible();
  for (const name of [
    "Marks & grading",
    "User accounts",
    "Students & faculty",
    "Reports & analytics",
    "Exam schedules",
    "Registrations",
  ])
    await expect(page.getByRole("link", { name, exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Assign duty", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Remove duty" })).toHaveCount(
    0,
  );
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Hall roster" }).click();
  const roster = page.getByRole("dialog");
  await expect(roster).toContainText("24UCC101");
  await expect(roster).toContainText("Aarav Sharma");
  await expect(
    roster.getByRole("columnheader", { name: "Seat", exact: true }),
  ).toBeVisible();
  await expect(roster).not.toContainText("Marks");
  await page.emulateMedia({ media: "print" });
  await expect(
    roster.getByRole("cell", { name: "24UCC101", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.getByRole("button", { name: "Print roster" })).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await roster.getByRole("button", { name: "Close", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".work/ta-duties-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("a faculty invigilator can monitor a different course without acquiring its grading permissions", async ({
  page,
}) => {
  // Set up this assignment independently of other browser scenarios.
  await login(page, "admin@examease.local");
  const existing = await page.request.get("/api/duties");
  if (
    !(await existing.json()).some(
      (d: { exam_id: string; user_id: string; status: string }) =>
        d.exam_id === "e-1" &&
        d.user_id === "u-faculty-2" &&
        d.status === "ASSIGNED",
    )
  ) {
    const result = await page.request.post("/api/duties", {
      data: { examId: "e-1", userId: "u-faculty-2" },
    });
    expect(result.status()).toBe(201);
  }
  await page.getByRole("button", { name: "Sign out" }).click();
  await login(page, "faculty2@examease.local");
  await page.getByRole("link", { name: "Exam hall duties" }).click();
  const row = page.locator("tr").filter({ hasText: "CS314" });
  await expect(row).toContainText("Faculty invigilator");
  await row.getByRole("button", { name: "Hall roster" }).click();
  await expect(page.getByRole("dialog")).toContainText("Software Engineering");
  await expect(page.getByRole("button", { name: "Remove duty" })).toHaveCount(
    0,
  );
  const forbidden = await page.request.get("/api/marks/exam/e-1");
  expect(forbidden.status()).toBe(403);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true })
    .click();
  await page.getByRole("link", { name: "Marks & grading" }).click();
  await expect(
    page
      .getByLabel("Examination", { exact: true })
      .locator('option[value="e-1"]'),
  ).toHaveCount(0);
});
