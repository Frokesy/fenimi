import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedAdmin, validateProduct } from "../server/admin-policy.js";
import { createWorker } from "../server/worker.js";
import { products } from "../src/catalog.js";
const worker = createWorker({
  "/index.html": { body: btoa("sample"), type: "text/html" },
});
const origin = "https://fenimi.test";
test("admin allowlist fails closed and matches whole normalized addresses", () => {
  assert.equal(isAllowedAdmin(null, "admin@example.com"), false);
  assert.equal(isAllowedAdmin("admin@example.com", ""), false);
  assert.equal(isAllowedAdmin("other@example.com", "admin@example.com"), false);
  assert.equal(
    isAllowedAdmin("ADMIN@example.com", " admin@example.com "),
    true,
  );
});
test("anonymous and non-admin sessions cannot write or enter dashboard", async () => {
  for (const email of [null, "customer@example.com"]) {
    const headers = email ? { "oai-authenticated-user-email": email } : {};
    const res = await worker.fetch(
      new Request(origin + "/api/admin/products", {
        method: "POST",
        headers,
        body: "{}",
      }),
      { ADMIN_EMAIL_ALLOWLIST: "admin@example.com" },
    );
    assert.equal(res.status, 403);
    const dashboard = await worker.fetch(
      new Request(origin + "/admin/dashboard", { headers }),
      { ADMIN_EMAIL_ALLOWLIST: "admin@example.com" },
    );
    assert.equal(dashboard.status, 303);
  }
});
test("authorized admin writes require same-origin requests and validated data", async () => {
  const env = { ADMIN_EMAIL_ALLOWLIST: "admin@example.com" },
    headers = {
      "oai-authenticated-user-email": "admin@example.com",
      origin: origin,
      "Content-Type": "application/json",
    };
  let res = await worker.fetch(
    new Request(origin + "/api/admin/products", {
      method: "POST",
      headers,
      body: JSON.stringify(products[1]),
    }),
    env,
  );
  assert.equal(res.status, 200);
  res = await worker.fetch(
    new Request(origin + "/api/admin/products", {
      method: "POST",
      headers: { ...headers, origin: "https://attacker.test" },
      body: JSON.stringify(products[1]),
    }),
    env,
  );
  assert.equal(res.status, 403);
  res = await worker.fetch(
    new Request(origin + "/api/admin/products", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...products[1], sizes: [] }),
    }),
    env,
  );
  assert.equal(res.status, 400);
});
test("missing allowlist never authorizes a signed-in visitor", async () => {
  const res = await worker.fetch(
    new Request(origin + "/api/admin/session", {
      headers: { "oai-authenticated-user-email": "admin@example.com" },
    }),
  );
  assert.equal((await res.json()).authenticated, false);
});
test("invalid prices, deposits and garment types are rejected", () => {
  assert.ok(validateProduct({ ...products[1], price: -1 }));
  assert.ok(validateProduct({ ...products[2], deposit: 150 }));
  assert.ok(validateProduct({ ...products[1], type: "unknown" }));
});
