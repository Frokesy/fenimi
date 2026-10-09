import { isAllowedAdmin, validateProduct } from "./admin-policy.js";
export function createWorker(assets) {
  return {
    async fetch(request, env = {}) {
      const url = new URL(request.url),
        path = url.pathname;
      const authenticated = isAllowedAdmin(
        request.headers.get("oai-authenticated-user-email"),
        env.ADMIN_EMAIL_ALLOWLIST,
      );
      const json = (data, status = 200) =>
        new Response(JSON.stringify(data), {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      if (path.startsWith("/api/admin/")) {
        if (path === "/api/admin/session" && request.method === "GET")
          return json({
            authenticated,
            method: "chatgpt",
            configured: !!env.ADMIN_EMAIL_ALLOWLIST,
          });
        if (!authenticated)
          return json({ error: "Admin access required." }, 403);
        if (request.method !== "POST")
          return json({ error: "Method not allowed." }, 405);
        if (request.headers.get("origin") !== url.origin)
          return json({ error: "Invalid request origin." }, 403);
        if (path === "/api/admin/products") {
          const raw = await request.text();
          if (raw.length > 16000)
            return json({ error: "Request too large." }, 413);
          let p;
          try {
            p = JSON.parse(raw);
          } catch {
            return json({ error: "Invalid JSON." }, 400);
          }
          const error = validateProduct(p);
          return error ? json({ error }, 400) : json({ ok: true });
        }
        return json({ error: "Not found." }, 404);
      }
      if (path === "/admin/dashboard" && !authenticated)
        return Response.redirect(`${url.origin}/admin`, 303);
      if (path.startsWith("/admin/") && path !== "/admin/dashboard")
        return new Response("Not found", { status: 404 });
      const name =
        path === "/" || path === "/admin" || path === "/admin/dashboard"
          ? "/index.html"
          : path;
      const asset = assets[name];
      if (!asset) return new Response("Not found", { status: 404 });
      const bytes = Uint8Array.from(atob(asset.body), (c) => c.charCodeAt(0));
      return new Response(request.method === "HEAD" ? null : bytes, {
        headers: {
          "Content-Type": asset.type,
          "Cache-Control":
            name === "/index.html" ? "no-store" : "public, max-age=86400",
          "X-Content-Type-Options": "nosniff",
        },
      });
    },
  };
}
