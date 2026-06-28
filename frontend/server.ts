import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.PORT ?? 4173);
const distDir = fileURLToPath(new URL("./dist/", import.meta.url));

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
};

function fileForPath(urlPath: string): string | null {
  const decodedPath = decodeURIComponent(urlPath);

  if (decodedPath.includes("..")) {
    return null;
  }

  const requestedPath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  return path.join(distDir, requestedPath);
}

Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok" });
    }

    const filePath = fileForPath(url.pathname);

    if (!filePath) {
      return new Response("Bad request", { status: 400 });
    }

    let servedPath = filePath;
    let file = Bun.file(servedPath);

    if (!(await file.exists())) {
      servedPath = path.join(distDir, "index.html");
      file = Bun.file(servedPath);
    }

    const contentType = contentTypes[path.extname(servedPath)] ?? file.type;

    return new Response(file, {
      headers: contentType ? { "Content-Type": contentType } : undefined,
    });
  },
});

console.log(`Crucible web server listening on http://localhost:${port}`);
