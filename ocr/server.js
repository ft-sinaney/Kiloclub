// Tiny dependency-free server: serves the web app and proxies handwriting
// reads to Claude so the API key never reaches the browser.
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");

// Minimal .env loader (no dependency). Real environment variables win.
const envFile = path.join(ROOT, ".env");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = Number(process.env.PORT || 3100);
// Localhost only by default: anyone who can reach this server can spend your API credit.
const HOST = process.env.HOST || "127.0.0.1";
const MODEL = process.env.OCR_MODEL || "claude-sonnet-5-5";
const API_BASE = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
const MAX_BODY = 12 * 1024 * 1024; // 12 MB of JSON (base64 image)
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const PROMPT = [
  "Transcribe all text in this image exactly as written. It may be handwriting, printed text, or a mix.",
  "Keep the original line breaks and order. Keep lists, bullets, numbers and punctuation as they appear.",
  "Do not correct spelling, translate, summarise or add commentary.",
  "If a word cannot be read, write [illegible] in its place.",
  "Reply with the transcription only. If the image contains no text, reply with exactly: [no text found]",
].join(" ");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error("Image is too large. Try a smaller photo."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/** Parse a data URL into { mediaType, data } or throw a 400. */
export function parseDataUrl(value) {
  const m = typeof value === "string" && value.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/i);
  if (!m) throw Object.assign(new Error("Send the image as a base64 data URL."), { status: 400 });
  const mediaType = m[1].toLowerCase();
  if (!ALLOWED_TYPES.has(mediaType)) {
    throw Object.assign(new Error("Unsupported image type. Use JPEG, PNG, WebP or GIF."), { status: 400 });
  }
  return { mediaType, data: m[2].replace(/\s/g, "") };
}

async function readWithClaude({ mediaType, data }) {
  const upstream = await fetch(`${API_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    }),
  });

  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const detail = payload?.error?.message || `Claude returned HTTP ${upstream.status}`;
    const status = upstream.status === 401 ? 502 : upstream.status === 429 ? 429 : 502;
    const message =
      upstream.status === 401 ? "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY." : detail;
    throw Object.assign(new Error(message), { status });
  }
  return (payload.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

async function handleApi(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/config") {
    return sendJson(res, 200, { claude: Boolean(process.env.ANTHROPIC_API_KEY), model: MODEL });
  }
  if (req.method === "POST" && pathname === "/api/ocr") {
    if (!process.env.ANTHROPIC_API_KEY) {
      return sendJson(res, 503, { error: "No ANTHROPIC_API_KEY set on the server. Use the offline engine or add a key." });
    }
    let body;
    try {
      body = JSON.parse(await readBody(req));
    } catch (err) {
      if (err.status) return sendJson(res, err.status, { error: err.message });
      return sendJson(res, 400, { error: "Request body must be JSON." });
    }
    try {
      const image = parseDataUrl(body.image);
      const text = await readWithClaude(image);
      return sendJson(res, 200, { text, engine: "claude", model: MODEL });
    } catch (err) {
      return sendJson(res, err.status || 500, { error: err.message || "Could not read the image." });
    }
  }
  return sendJson(res, 404, { error: "Not found" });
}

async function handleStatic(res, pathname) {
  const rel = pathname === "/" ? "/index.html" : pathname;
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const content = await readFile(file);
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(file)] || "application/octet-stream",
      // Camera access is only allowed for this origin.
      "Permissions-Policy": "camera=(self)",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    if (pathname.startsWith("/api/")) return handleApi(req, res, pathname);
    return handleStatic(res, pathname);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(PORT, HOST, () => {
    console.log(`OCR app running at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
    console.log(
      process.env.ANTHROPIC_API_KEY
        ? `Handwriting engine: Claude (${MODEL})`
        : "No ANTHROPIC_API_KEY set: only the offline engine (printed text) will work.",
    );
  });
}
