import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

async function capture(page, name) {
  if (process.env.CAPTURE_PORTFOLIO !== "1") return;
  await mkdir("../../docs/images", { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `../../docs/images/${name}.png`, fullPage: true });
}

test("overview, chat, graph, document download, and reset", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");
  await expect(page.getByText("Interactive demo", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Complex SQL\./ })).toBeVisible();
  await capture(page, "overview");
  await page.getByRole("link", { name: "Explore the demo" }).click();
  await page.getByRole("button", { name: /How is monthly revenue calculated/ }).click();
  await expect(
    page.getByRole("heading", { name: "From completed bookings to monthly revenue" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: /Query relationship graph/ })).toBeVisible();
  await capture(page, "conversation");
  await page.getByText("View relationships as text").click();
  await expect(page.getByText("Your query → booking (reads)")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: /Download documentation/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/softwaredocbot-.+\.docx$/);
  await page.getByRole("button", { name: "New conversation" }).click();
  await expect(
    page.getByRole("heading", { name: "What would you like to understand?" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("generator loads a sample and refuses unsupported demo questions", async ({ page }) => {
  await page.goto("/model1");
  await expect(page.getByLabel("START WITH AN EXAMPLE")).toBeEnabled();
  await page.getByLabel("START WITH AN EXAMPLE").selectOption("revenue");
  await page.getByRole("button", { name: "Show sample SQL" }).click();
  await expect(page.locator(".sql-output")).toContainText("SUM(b.total)");
  await page.getByLabel("Business question").fill("Forecast revenue for tomorrow");
  await page.getByRole("button", { name: "Show sample SQL" }).click();
  await expect(page.getByRole("alert")).toContainText("bundled question/schema pairs");
});

test("explainer responds to edited SQL and validates invalid statements", async ({ page }) => {
  await page.goto("/model2");
  await expect(page.getByLabel("START WITH AN EXAMPLE")).toBeEnabled();
  await page.getByLabel("Business question").fill("Which bookings exceed 100?");
  await page
    .getByLabel("Database schema")
    .fill("CREATE TABLE booking (id INT, total DECIMAL(10,2));");
  await page
    .getByLabel("SQL query", { exact: false })
    .fill("SELECT id, total FROM booking WHERE total > 100 ORDER BY total DESC LIMIT 5;");
  await page.getByRole("button", { name: "Explain query", exact: true }).click();
  await expect(page.locator(".result-content")).toContainText("total > 100");
  await expect(page.locator(".result-content")).toContainText("Return at most");
  await capture(page, "sql-explainer");
  await page.getByLabel("SQL query", { exact: false }).fill("DELETE FROM booking;");
  await page.getByRole("button", { name: "Explain query", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("SELECT");
});

test("API errors remain visible and preserve the question", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByText("Interactive demo", { exact: true })).toBeVisible();
  await page.route("**/api/message", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "The model is temporarily unavailable." }),
    }),
  );
  await page.getByLabel("Your question").fill("How is monthly revenue calculated?");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("alert")).toContainText("temporarily unavailable");
  await expect(page.getByLabel("Your question")).toHaveValue("How is monthly revenue calculated?");
  await expect(page.getByRole("button", { name: "Send question" })).toBeEnabled();
});

test("navigation remains available while a workspace page loads", async ({ page }) => {
  let release;
  const loading = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/src/pages/ChatPage.jsx*", async (route) => {
    await loading;
    await route.continue();
  });
  try {
    await page.goto("/chat", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Opening workspace…");
    await page.getByRole("link", { name: "Overview", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Complex SQL\./ })).toBeVisible();
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("mobile layout and direct routes work without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/chat", "/model1", "/model2"]) {
    await page.goto(route);
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SQL explainer", exact: true })).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (route === "/") await capture(page, "mobile");
  }
  await page.goto("/missing-page");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await page.getByRole("link", { name: "Back to overview" }).click();
  await expect(page).toHaveURL("http://127.0.0.1:15173/");
});
