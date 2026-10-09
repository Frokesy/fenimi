import { readFile, readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
};
const assets = {};
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else
      assets["/" + path.relative("build", file).split(path.sep).join("/")] = {
        body: (await readFile(file)).toString("base64"),
        type: types[path.extname(file)] || "application/octet-stream",
      };
  }
}
await walk("build");
await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
const policy = (await readFile("server/admin-policy.js", "utf8")).replaceAll(
  "export ",
  "",
);
const worker = (await readFile("server/worker.js", "utf8"))
  .replace(/^import .*;\n/, "")
  .replace("export function", "function");
await writeFile(
  "dist/server/index.js",
  `${policy}\n${worker}\nconst assets=${JSON.stringify(assets)};\nexport default createWorker(assets);\n`,
);
await writeFile(
  "dist/.openai/hosting.json",
  await readFile(".openai/hosting.json"),
);
console.log(
  "Packaged React assets and server-enforced admin authorization into dist/server/index.js",
);
