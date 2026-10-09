import { test } from "node:test";
import assert from "node:assert/strict";
import { products, due, escapeHTML, garmentSVG } from "../dist/catalog.js";
test("collection covers all purchase journeys and clothing categories", () => {
  assert.equal(products.length, 6);
  assert.deepEqual(
    new Set(products.map((p) => p.mode)),
    new Set(["full", "deposit", "quote"]),
  );
  assert.equal(new Set(products.map((p) => p.category)).size, 3);
});
test("deposits charge only the configured portion", () => {
  assert.equal(due(products[2]), 26000);
  assert.equal(due(products[5]), 42500);
  assert.equal(due(products[0]), 48000);
});
test("uploaded names cannot inject markup into cards or SVG labels", () => {
  assert.equal(
    escapeHTML('<img onerror="alert(1)">'),
    "&lt;img onerror=&quot;alert(1)&quot;&gt;",
  );
  assert.ok(
    !garmentSVG({ ...products[0], name: "<script>bad</script>" }).includes(
      "<script>",
    ),
  );
});
