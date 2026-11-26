import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

// Fake Anthropic API so tests never touch the network or spend credit.
let seen;
const fake = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    seen = { headers: req.headers, body: JSON.parse(body) };
    if (req.headers["x-api-key"] === "bad") {
      res.writeHead(401, { "content-type": "application/json" });
      return res.end(JSON.stringify({ error: { message: "invalid x-api-key" } }));
    }
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ content: [{ type: "text", text: "  Buy milk\nCall Sam  " }] }));
  });
});
await new Promise((r) => fake.listen(0, "127.0.0.1", r));
process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${fake.address().port}`;
process.env.ANTHROPIC_API_KEY = "test-key";

const { createServer, parseDataUrl } = await import("./server.js");
const app = createServer();
await new Promise((r) => app.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${app.address().port}`;
after(() => { app.close(); fake.close(); });

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
const post = (body) => fetch(`${base}/api/ocr`, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });

test("config reports Claude available", async () => {
  const cfg = await (await fetch(`${base}/api/config`)).json();
  assert.equal(cfg.claude, true);
});

test("reads an image through Claude and trims the text", async () => {
  const res = await post({ image: PNG });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).text, "Buy milk\nCall Sam");
  assert.equal(seen.headers["x-api-key"], "test-key");
  const block = seen.body.messages[0].content[0];
  assert.equal(block.source.media_type, "image/png");
  assert.ok(!block.source.data.startsWith("data:"));
});

test("rejects non-image and malformed input", async () => {
  assert.equal((await post({ image: "data:text/html;base64,PGI+" })).status, 400);
  assert.equal((await post({ image: "hello" })).status, 400);
  assert.equal((await post("not json")).status, 400);
});

test("rejects oversized bodies", async () => {
  const res = await post({ image: "data:image/png;base64," + "A".repeat(13 * 1024 * 1024) }).catch(() => ({ status: 413 }));
  assert.equal(res.status, 413);
});

test("static files are served and path traversal is blocked", async () => {
  assert.equal((await fetch(`${base}/`)).status, 200);
  const res = await fetch(`${base}/..%2Fserver.js`);
  assert.notEqual(res.status, 200);
  const raw = await new Promise((resolve) => {
    http.get({ host: "127.0.0.1", port: app.address().port, path: "/../server.js" }, (r) => resolve(r.statusCode));
  });
  assert.notEqual(raw, 200);
});

test("parseDataUrl accepts jpeg/webp", () => {
  assert.equal(parseDataUrl("data:image/jpeg;base64,AAAA").mediaType, "image/jpeg");
  assert.equal(parseDataUrl("data:image/webp;base64,AAAA").mediaType, "image/webp");
});
