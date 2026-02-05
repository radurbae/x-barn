import { expect, test } from "@playwright/test";

test("cashier checkout and reports flow", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email", { exact: true }).fill("demo@barn.coffee");
  await page.getByLabel("Password", { exact: true }).fill("demo123");
  await page.getByRole("button", { name: /masuk|login/i }).click();

  await page.waitForURL("**/pos");

  await page.getByRole("button", { name: /espresso/i }).first().click();

  await page.getByRole("button", { name: /bayar|pay/i }).click();

  await page
    .getByLabel(/payment amount|jumlah pembayaran/i)
    .fill("100000");

  await page
    .getByRole("button", { name: /selesaikan|complete/i })
    .click();

  await page.goto("/pos/reports");
  await expect(
    page.getByText(/recent orders|pesanan terbaru/i)
  ).toBeVisible();
});
