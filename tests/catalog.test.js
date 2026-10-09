import { test } from "node:test";
import assert from "node:assert/strict";
import { products, due, escapeHTML, garmentSVG } from "../src/catalog.js";
import { selectOutfit, outfitItems } from "../src/outfit.js";
test("catalog covers all purchase journeys and clothing categories", () => {
  assert.equal(products.length, 6);
  assert.deepEqual(
    new Set(products.map((p) => p.mode)),
    new Set(["full", "deposit", "quote"]),
  );
  assert.equal(new Set(products.map((p) => p.category)).size, 3);
});
test("deposit calculation charges only configured amount", () => {
  assert.equal(due(products[2]), 26000);
  assert.equal(due(products[5]), 42500);
  assert.equal(due(products[0]), 48000);
});
test("product names are escaped in illustrations", () => {
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
test("separate shirt and trousers coexist with an outer jacket", () => {
  let s = selectOutfit({}, products[1], "M");
  s = selectOutfit(s, products[5], "L");
  s = selectOutfit(s, products[3], "S");
  assert.equal(outfitItems(s, products).length, 3);
  assert.equal(s.top.id, 2);
  assert.equal(s.bottom.id, 6);
  assert.equal(s.outer.id, 4);
});
test("complete looks replace conflicting pieces and separates replace complete looks", () => {
  let s = selectOutfit(selectOutfit({}, products[1], "M"), products[5], "M");
  s = selectOutfit(s, products[0], "S");
  assert.deepEqual(Object.keys(s), ["complete"]);
  s = selectOutfit(s, products[5], "L");
  assert.deepEqual(Object.keys(s), ["bottom"]);
});
test("selecting a replacement top preserves trousers", () => {
  const extra = { ...products[1], id: 9 };
  let s = selectOutfit(selectOutfit({}, products[1], "M"), products[5], "S");
  s = selectOutfit(s, extra, "L");
  assert.equal(s.top.id, 9);
  assert.equal(s.bottom.id, 6);
});
