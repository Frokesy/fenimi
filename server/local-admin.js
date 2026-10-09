import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { validateProduct } from "./admin-policy.js";
export function localAdminPlugin(env) {
  const sessions = new Map(),
    attempts = new Map();
  const password =
    env.LOCAL_ADMIN_PASSWORD || process.env.LOCAL_ADMIN_PASSWORD || "";
  const configured = password.length >= 12;
  const sessionKey = (req) =>
    /fenimi_admin=([a-f0-9]+)/.exec(req.headers.cookie || "")?.[1];
  const authenticated = (req) => {
    const key = sessionKey(req),
      expiry = sessions.get(key);
    if (!expiry || expiry < Date.now()) {
      sessions.delete(key);
      return false;
    }
    return true;
  };
  const install = (server) => {
    server.middlewares.use(async (req, res, next) => {
      const path = req.url.split("?")[0];
      if (!path.startsWith("/api/admin/")) return next();
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", "application/json");
      const reply = (status, data) => {
        res.statusCode = status;
        res.end(JSON.stringify(data));
      };
      if (req.method === "GET" && path === "/api/admin/session")
        return reply(200, {
          authenticated: authenticated(req),
          method: "password",
          configured,
        });
      if (req.method !== "POST")
        return reply(405, { error: "Method not allowed." });
      if (req.headers.origin !== `http://${req.headers.host}`)
        return reply(403, { error: "Invalid request origin." });
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 16000)
          return reply(413, { error: "Request too large." });
      }
      let data;
      try {
        data = JSON.parse(body || "{}");
      } catch {
        return reply(400, { error: "Invalid JSON." });
      }
      if (path === "/api/admin/login") {
        if (!configured)
          return reply(503, {
            error:
              "Set LOCAL_ADMIN_PASSWORD (12+ characters) in .env.local and restart the dev server.",
          });
        const key = req.socket.remoteAddress;
        let attempt = attempts.get(key);
        if (!attempt || attempt.reset < Date.now())
          attempt = { count: 0, reset: Date.now() + 60000 };
        attempts.set(key, attempt);
        if (++attempt.count > 10)
          return reply(429, {
            error: "Too many attempts. Try again in a minute.",
          });
        const digest = (s) => createHash("sha256").update(s).digest();
        if (
          typeof data.password !== "string" ||
          !timingSafeEqual(digest(data.password), digest(password))
        )
          return reply(401, { error: "Incorrect admin password." });
        const token = randomBytes(32).toString("hex");
        sessions.set(token, Date.now() + 8 * 60 * 60 * 1000);
        attempts.delete(key);
        res.setHeader(
          "Set-Cookie",
          `fenimi_admin=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=28800`,
        );
        return reply(200, { authenticated: true });
      }
      if (!authenticated(req))
        return reply(401, { error: "Admin sign-in required." });
      if (path === "/api/admin/logout") {
        sessions.delete(sessionKey(req));
        res.setHeader(
          "Set-Cookie",
          "fenimi_admin=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0",
        );
        return reply(200, { ok: true });
      }
      if (path === "/api/admin/products") {
        const error = validateProduct(data);
        return reply(error ? 400 : 200, error ? { error } : { ok: true });
      }
      return reply(404, { error: "Not found." });
    });
  };
  return {
    name: "fenimi-local-admin",
    configureServer: install,
    configurePreviewServer: install,
  };
}
