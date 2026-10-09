import { lazy, Suspense, useEffect, useState } from "react";
const Admin = lazy(() => import("../pages/Admin.jsx"));
export default function AdminGate({ onAdd, onNavigate, path }) {
  const [session, setSession] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function refresh() {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      if (!res.ok) throw Error("Unable to check admin access.");
      const data = await res.json();
      setSession(data);
      if (!data.authenticated && path === "/admin/dashboard")
        onNavigate("/admin");
    } catch (e) {
      setError(e.message);
      setSession({ authenticated: false, method: "unavailable" });
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = e.currentTarget;
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: new FormData(form).get("password") }),
      });
      const data = await res.json();
      form.reset();
      if (!res.ok) throw Error(data.error);
      setSession({ authenticated: true, method: "password", configured: true });
      onNavigate("/admin/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (session.method === "chatgpt") {
      location.href = "/signout-with-chatgpt?return_to=%2Fadmin";
      return;
    }
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    setSession({ ...session, authenticated: false });
    onNavigate("/admin");
  }
  if (session?.authenticated)
    return (
      <Suspense
        fallback={<div className="admin-login">Opening your studio…</div>}
      >
        <Admin onAdd={onAdd} onNavigate={onNavigate} onLogout={logout} />
      </Suspense>
    );
  return (
    <main className="admin-login">
      <a
        className="wordmark"
        href="/"
        onClick={(e) => {
          e.preventDefault();
          onNavigate("/");
        }}
      >
        fenimi<span>STUDIO</span>
      </a>
      <span className="eyebrow">PRIVATE / ADMIN ACCESS</span>
      <h1>
        Your collection.
        <br />
        <em>Your studio.</em>
      </h1>
      <p>This area is reserved for authorized administrators.</p>
      {!session ? (
        <p role="status">Checking access…</p>
      ) : session.method === "password" ? (
        <>
          {!session.configured && (
            <p className="demo-banner">
              Local admin access is locked. Set LOCAL_ADMIN_PASSWORD (12+
              characters) in .env.local and restart the dev server.
            </p>
          )}
          <form className="form-fields" onSubmit={login}>
            <label>
              Admin password
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                disabled={!session.configured}
              />
            </label>
            <button
              className="button"
              type="submit"
              disabled={busy || !session.configured}
            >
              {busy ? "Signing in…" : "Sign in to Studio ↗"}
            </button>
          </form>
        </>
      ) : session.method === "chatgpt" ? (
        <>
          <p className="demo-banner">
            Sign in with an account on the admin allowlist. Other signed-in
            visitors cannot enter Studio.
          </p>
          <a
            className="button"
            target="_top"
            href="/signin-with-chatgpt?return_to=%2Fadmin%2Fdashboard"
          >
            Sign in with ChatGPT ↗
          </a>
        </>
      ) : (
        <button className="button" onClick={refresh}>
          Retry access check
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="text-link" onClick={() => onNavigate("/")}>
        Return to storefront ↗
      </button>
    </main>
  );
}
