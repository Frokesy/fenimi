# Fenimi Fashion

React + Vite storefront with Motion for React animations and a Three.js outfit preview. The editable app lives in `src/`; `build/` and `dist/` are generated production output.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Restart an old Python preview server before starting Vite on that port.

## Admin access

Studio is at `/admin`, separate from customer navigation. The dashboard is at `/admin/dashboard`.

For local development, copy `.env.example` to `.env.local`, set `LOCAL_ADMIN_PASSWORD` to your own password of at least 12 characters, then restart Vite. The password is read by server middleware, never included in the browser bundle. Login uses an HttpOnly, SameSite=Strict cookie, an eight-hour server session and rate limiting. Admin writes require both a valid session and a same-origin request. Without a configured password, access stays locked. Local authentication is for the loopback development/preview server only, not an internet-facing production password service.

Hosted Studio uses Sites' signed-in ChatGPT identity and a server-side `ADMIN_EMAIL_ALLOWLIST` runtime variable. It currently allows the Site owner. Add your friend's signed-in email to that runtime allowlist and grant her Site access before handoff. Missing identity, a missing allowlist and non-admin identities are denied; all admin operations validate authorization server-side. The Site's private audience is preserved.

## Customer outfit previews

Every product card, product detail and bag item has a mannequin preview action. Customers can select a shirt, separate trousers and an outer jacket. A dress, gown or complete set replaces conflicting separates; selecting a separate replaces a complete look. Choosing another item in the same slot replaces that item. Sizes can be selected in the fitting room before adding the chosen pieces to the bag. Quote-only products keep their separate quote journey.

Preview geometry is schematic. It demonstrates styling and combinations, not actual fabric drape or sizing. Real photo-to-3D generation remains a simulated admin workflow.

## Code guide

- `src/App.jsx` owns catalog, bag, selected garments and navigation state.
- `src/pages/Storefront.jsx` contains the storefront and its Motion animations; `src/pages/Admin.jsx` contains the separate admin form.
- `src/components/` contains accessible dialogs, shopping journeys and the fitting room. `src/scene.js` owns Three.js rendering and resource cleanup.
- `src/outfit.js` defines garment slot selection rules; `src/catalog.js` contains the six sample products.
- `server/` contains local authentication, hosted authorization and product validation. `scripts/package-worker.mjs` packages the Vite build as a Sites Worker.

## Verification and builds

```bash
npm run check
npm run build
npm run preview
```

`npm run preview` also uses the local admin middleware and `.env.local`. `npm run build` produces a React static build in `build/`. `npm run build:sites` additionally packages a Sites Worker in `dist/server/index.js`, including the bundled static assets and server authorization; it requires `.openai/hosting.json` from the Sites hosting setup. Never edit generated output.

## Deploy to Vercel

Import this repository with the Root Directory set to the directory containing `package.json` and `vercel.json` (the repository root). The checked-in Vercel configuration selects Vite, runs `npm run build`, and serves `build/`. It also serves the React entry point for direct visits to `/admin` and `/admin/dashboard`.

Push these files to the connected Git branch to create a new deployment. If configuring the project manually, use Framework Preset **Vite**, Build Command **npm run build**, and Output Directory **build**.

This deploys the customer storefront. The local admin middleware and Sites Worker do not run on Vercel; Studio authentication and product writes require a separate Vercel-compatible backend. Setting `LOCAL_ADMIN_PASSWORD` in Vercel alone will not enable admin access.

The browser regression suite is `tests/browser.cjs`. Run a dedicated local QA server on port 5174 with a temporary `LOCAL_ADMIN_PASSWORD`, then run `QA_ADMIN_PASSWORD=<same-temporary-password> node tests/browser.cjs`. Set `QA_URL` if using another port. Install the Playwright Chromium browser first with `npx playwright install chromium`. The suite covers separate-item previews, conflicting garments, sizes, full/deposit/quote checkout, admin login/logout and rejected writes, upload/conversion states, mobile, reduced motion, keyboard dismissal and the 3D fallback.

All prices, dates, payments and orders are illustrative. Catalog edits and uploaded image previews stay in this browser session; refreshing resets them. Images are local object URLs and are never submitted to a conversion service. The authenticated product endpoint validates additions but does not persist a production catalog. Real storage, payment-provider integration, fulfillment fees and actual garment reconstruction remain launch work.

The editorial photograph is an Unsplash sample (photo-1539109136881-3be0616acf4b). Product illustrations and mannequin geometry are original code-created assets. Three.js uses the MIT license. Fonts are loaded from Google Fonts with system fallbacks.
