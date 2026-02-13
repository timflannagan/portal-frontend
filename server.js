import express from "express";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || "4000", 10);
const DIST = resolve(__dirname, "dist");

// Collect VITE_* env vars for runtime injection.
const runtimeEnv = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => k.startsWith("VITE_"))
);

// Read the built index.html and inject env vars as window.__ENV__.
const rawHtml = readFileSync(resolve(DIST, "index.html"), "utf-8");
const envScript = `<script>window.__ENV__=${JSON.stringify(runtimeEnv)};</script>`;
const html = rawHtml.replace("</head>", `${envScript}\n</head>`);

const app = express();

// Serve static assets with caching (hashed filenames).
app.use(
  "/assets",
  express.static(resolve(DIST, "assets"), {
    maxAge: "1y",
    immutable: true,
  })
);

// Serve other static files (favicon, etc.) without long cache.
app.use(express.static(DIST, { index: false }));

// SPA fallback: serve the env-injected index.html for all routes.
app.get("*", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Portal frontend serving on port ${PORT}`);
});
