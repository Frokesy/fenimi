export const slotFor = (p) =>
  ["dress", "gown", "set"].includes(p.type)
    ? "complete"
    : p.type === "trousers"
      ? "bottom"
      : p.type === "jacket"
        ? "outer"
        : "top";
export function selectOutfit(current, product, size) {
  const slot = slotFor(product);
  const next = { ...current };
  if (slot === "complete") return { [slot]: { id: product.id, size } };
  delete next.complete;
  next[slot] = { id: product.id, size };
  return next;
}
export const outfitItems = (selection, catalog) =>
  Object.entries(selection)
    .map(([slot, item]) => ({
      slot,
      size: item.size,
      product: catalog.find((p) => p.id === item.id),
    }))
    .filter((x) => x.product);
