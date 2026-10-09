const { chromium } = require("@playwright/test");
const assert = require("node:assert/strict");
const base = process.env.QA_URL || "http://127.0.0.1:5174";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base);
  await page.locator(".product-card").first().waitFor();
  assert.equal(await page.locator(".product-card").count(), 6);
  assert.equal(await page.locator("header").getByText("Studio").count(), 0);
  assert.equal(await page.locator('a[href="/admin"]').count(), 0);
  await page.waitForTimeout(1800);
  await page.screenshot({ path: "/tmp/fenimi-react-desktop.png" });
  await page.getByRole("button", { name: "Streetwear", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 2,
  );
  assert.equal(await page.locator(".product-card").count(), 2);
  await page.getByRole("button", { name: "All pieces", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 6,
  );
  await page.locator('[data-product="2"] .catalog-preview').click();
  await page.locator("dialog.outfit-dialog").waitFor();
  await page
    .locator(".outfit-picker button")
    .filter({ hasText: "The Form Trousers" })
    .click();
  await page
    .locator(".outfit-item")
    .filter({ hasText: "The Sculpted Shirt" })
    .waitFor();
  assert.equal(await page.locator(".outfit-item").count(), 2);
  assert.equal(await page.locator(".outfit-dialog canvas").count(), 1);
  await page.getByLabel("Size for The Sculpted Shirt").selectOption("M");
  await page.getByLabel("Size for The Form Trousers").selectOption("L");
  await page
    .locator(".outfit-dialog")
    .screenshot({ path: "/tmp/fenimi-react-outfit.png" });
  await page
    .getByRole("button", { name: "Add selected pieces to bag" })
    .click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#bagCount").textContent(), "2");
  await page.getByRole("button", { name: /^Bag/ }).click();
  await page
    .getByRole("button", { name: "Increase The Sculpted Shirt quantity" })
    .click();
  assert.equal(await page.locator("#bagCount").textContent(), "3");
  await page
    .getByRole("button", { name: "Decrease The Sculpted Shirt quantity" })
    .click();
  await page
    .getByRole("button", { name: "Continue to sample checkout" })
    .click();
  await page.getByRole("button", { name: "Simulate payment" }).click();
  await page
    .getByText("Sample balance before dispatch:", { exact: false })
    .waitFor();
  assert.equal(await page.locator("#bagCount").textContent(), "0");
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await page.waitForTimeout(500);
  await page.locator('[data-product="5"] .product-art').click();
  await page.getByRole("button", { name: "L", exact: true }).click();
  await page.getByRole("button", { name: "Request a sample quote" }).click();
  await page.getByRole("button", { name: "Preview quote request" }).click();
  await page
    .getByText("No request was sent and no payment was collected.")
    .waitFor();
  await page.getByRole("button", { name: "Keep exploring" }).click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /^My look/ }).click();
  await page
    .locator(".outfit-picker button")
    .filter({ hasText: "The Column Dress" })
    .click();
  await page.waitForFunction(() => document.querySelectorAll(".outfit-item").length === 1);
  assert.equal(await page.locator(".outfit-item").count(), 1);
  await page
    .locator(".outfit-picker button")
    .filter({ hasText: "The Form Trousers" })
    .click();
  await page.waitForTimeout(500);
  await page.waitForFunction(() => document.querySelectorAll(".outfit-item").length === 1);
  assert.equal(await page.locator(".outfit-item").count(), 1);
  await page.getByRole("button", { name: "Close outfit preview" }).click();
  await page.waitForTimeout(400);
  const blocked = await page.request.post(base + "/api/admin/products", {
    data: { name: "Unauthorized" },
    headers: { origin: base },
  });
  assert.equal(blocked.status(), 401);
  await page.goto(base + "/admin/dashboard");
  await page.getByLabel("Admin password").waitFor();
  assert.ok(page.url().endsWith("/admin"));
  assert.equal(
    await page.getByText("Collection desk.", { exact: true }).count(),
    0,
  );
  await page.getByLabel("Admin password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in to Studio" }).click();
  await page.getByText("Incorrect admin password.").waitFor();
  await page
    .getByLabel("Admin password")
    .fill(process.env.QA_ADMIN_PASSWORD || "fenimi-qa-password-only");
  await page.getByRole("button", { name: "Sign in to Studio" }).click();
  await page.getByText("Collection desk.", { exact: true }).waitFor();
  assert.ok(page.url().endsWith("/admin/dashboard"));
  await page
    .locator('input[type="file"]')
    .setInputFiles("public/assets/editorial.jpg");
  await page.getByLabel("Demonstrate generation failure").check();
  await page.getByRole("button", { name: "Generate sample preview" }).click();
  await page.getByText("Simulated failure:", { exact: false }).waitFor();
  await page.getByLabel("Demonstrate generation failure").uncheck();
  await page.getByRole("button", { name: "Retry sample generation" }).click();
  await page.getByRole("button", { name: "Approve sample preview" }).click();
  await page.getByLabel("Product name", { exact: true }).fill("QA sample top");
  await page.getByLabel("Description", { exact: true }).fill("A test product.");
  await page.getByLabel("Purchase option").selectOption("deposit");
  await page.getByLabel("Deposit percentage").fill("30");
  await page.getByRole("button", { name: "Add sample product" }).click();
  await page
    .getByText("Sample product added to the storefront for this session.", {
      exact: false,
    })
    .waitFor();
  await page.getByRole("button", { name: "View storefront" }).click();
  await page.locator('[data-product="7"]').waitFor();
  assert.equal(await page.locator(".product-card").count(), 7);
  await page.goto(base + "/admin");
  await page.getByText("Collection desk.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.getByLabel("Admin password").waitFor();
  const loggedOut = await page.request.post(base + "/api/admin/products", {
    data: { name: "Unauthorized" },
    headers: { origin: base },
  });
  assert.equal(loggedOut.status(), 401);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator(".product-card").first().waitFor();
  await page.waitForTimeout(1700);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  await page.screenshot({ path: "/tmp/fenimi-react-mobile.png" });
  await page.locator('[data-product="2"] .catalog-preview').click();
  await page
    .locator(".outfit-picker button")
    .filter({ hasText: "The Form Trousers" })
    .click();
  await page.getByLabel("Size for The Sculpted Shirt").selectOption("S");
  await page.getByLabel("Size for The Form Trousers").selectOption("M");
  assert.equal(
    await page.evaluate(
      () =>
        document.querySelector("dialog").scrollWidth <=
        document.querySelector("dialog").clientWidth + 2,
    ),
    true,
  );
  await page
    .getByRole("button", { name: "Add selected pieces to bag" })
    .click();
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#bagCount").textContent(), "2");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: /^My look/ }).click();
  await page.getByRole("button", { name: "Resume rotation" }).last().waitFor();
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement !== document.body),
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("dialog[open]").count(), 0);
  const fallback = await browser.newPage();
  await fallback.route("**/src/scene.js", (r) => r.abort());
  await fallback.goto(base);
  await fallback.locator('[data-product="1"] .catalog-preview').click();
  await fallback
    .getByText("3D preview unavailable.", { exact: false })
    .last()
    .waitFor();
  assert.equal(await fallback.locator(".product-card").count(), 6);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log(
    "PASS: React desktop/mobile shopping, outfit composition, conflicts, full/deposit/quote flows, server admin login/logout and denied writes, upload/conversion states, reduced motion, keyboard dismissal, and 3D failure fallback.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
