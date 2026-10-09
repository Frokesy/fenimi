export function isAllowedAdmin(email, allowlist = "") {
  if (!email) return false;
  return allowlist
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}
export function validateProduct(p) {
  const types = ["shirt", "trousers", "jacket", "dress", "gown", "set"];
  if (!p || typeof p.name !== "string" || !p.name.trim() || p.name.length > 80)
    return "Enter a product name under 80 characters.";
  if (
    !["Womenswear", "Streetwear", "Occasion"].includes(p.category) ||
    !types.includes(p.type)
  )
    return "Choose a valid category and garment type.";
  if (!Number.isFinite(p.price) || p.price < 100 || p.price > 10000000)
    return "Enter a valid price.";
  if (!["full", "deposit", "quote"].includes(p.mode))
    return "Choose a purchase option.";
  if (
    p.mode === "deposit" &&
    (!Number.isFinite(p.deposit) || p.deposit < 1 || p.deposit > 99)
  )
    return "Deposit must be between 1 and 99 percent.";
  if (
    !Array.isArray(p.sizes) ||
    !p.sizes.length ||
    p.sizes.some((s) => !["XS", "S", "M", "L", "XL"].includes(s))
  )
    return "Choose available sizes.";
  if (
    typeof p.description !== "string" ||
    !p.description.trim() ||
    p.description.length > 2000
  )
    return "Enter a description under 2000 characters.";
  if (
    !["Preorder", "Ready to ship", "Made to order"].includes(p.availability) ||
    typeof p.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(p.date) ||
    Number.isNaN(Date.parse(p.date))
  )
    return "Choose availability and a valid dispatch date.";
  return null;
}
