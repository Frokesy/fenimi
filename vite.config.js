import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { localAdminPlugin } from "./server/local-admin.js";
export default defineConfig(({ mode }) => ({
  plugins: [react(), localAdminPlugin(loadEnv(mode, process.cwd(), ""))],
  build: { outDir: "build", emptyOutDir: true },
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
}));
