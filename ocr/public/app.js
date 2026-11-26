"use strict";

const $ = (id) => document.getElementById(id);
const el = {
  cameraBtn: $("cameraBtn"), uploadBtn: $("uploadBtn"), fileInput: $("fileInput"),
  cameraPanel: $("cameraPanel"), video: $("video"), captureBtn: $("captureBtn"),
  switchBtn: $("switchBtn"), closeCameraBtn: $("closeCameraBtn"),
  preview: $("preview"), previewImg: $("previewImg"), work: $("work"),
  readBtn: $("readBtn"), status: $("status"), statusText: $("statusText"), barFill: $("barFill"),
  error: $("error"), resultCard: $("resultCard"), result: $("result"),
  copyBtn: $("copyBtn"), downloadBtn: $("downloadBtn"), clearBtn: $("clearBtn"),
  claudeNote: $("claudeNote"),
  engines: document.querySelectorAll('input[name="engine"]'),
};

const MAX_SIDE = 2000; // longest edge sent for reading; keeps uploads small but legible
let stream = null;
let facing = "environment";
let image = null; // { canvas } holding the current picture
let busy = false;

/* ---------- messages ---------- */
function showError(msg) { el.error.textContent = msg; el.error.hidden = !msg; }
function setStatus(text, fraction) {
  el.status.hidden = !text;
  el.statusText.textContent = text || "";
  if (fraction == null) {
    el.barFill.classList.add("indeterminate");
    el.barFill.style.width = "";
  } else {
    el.barFill.classList.remove("indeterminate");
    el.barFill.style.width = `${Math.round(fraction * 100)}%`;
  }
}
const engine = () => document.querySelector('input[name="engine"]:checked')?.value;

/* ---------- engines available ---------- */
async function loadConfig() {
  const claudeRadio = document.querySelector('input[value="claude"]');
  const offline = document.querySelector('input[value="tesseract"]');
  let claude = false;
  try {
    const cfg = await (await fetch("/api/config")).json();
    claude = cfg.claude;
  } catch { /* server unreachable: offline only */ }
  claudeRadio.disabled = !claude;
  el.claudeNote.textContent = claude
    ? "Uses Claude. Best for handwriting."
    : "Needs an Anthropic API key on the server (see README).";
  (claude ? claudeRadio : offline).checked = true;
}

/* ---------- getting an image ---------- */
function setImageFromSource(source, w, h) {
  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#fff"; // flatten transparency so PNGs with alpha read correctly
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  image = { canvas };
  el.previewImg.src = canvas.toDataURL("image/jpeg", 0.85);
  el.preview.hidden = false;
  el.readBtn.disabled = false;
  showError("");
}

async function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return showError("That file isn't an image. Choose a photo or screenshot.");
  try {
    // imageBitmap applies the photo's EXIF rotation, so phone photos stay upright.
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    setImageFromSource(bmp, bmp.width, bmp.height);
    stopCamera();
  } catch {
    showError("Couldn't open that image. Try a JPEG or PNG.");
  }
}

el.uploadBtn.addEventListener("click", () => el.fileInput.click());
el.fileInput.addEventListener("change", () => { loadFile(el.fileInput.files[0]); el.fileInput.value = ""; });

document.addEventListener("paste", (e) => {
  const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"));
  if (item) loadFile(item.getAsFile());
});
const dropZone = document.querySelector("section.card");
for (const ev of ["dragenter", "dragover"]) dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.add("drag"); });
for (const ev of ["dragleave", "drop"]) dropZone.addEventListener(ev, (e) => { e.preventDefault(); dropZone.classList.remove("drag"); });
dropZone.addEventListener("drop", (e) => loadFile(e.dataTransfer.files[0]));

/* ---------- camera ---------- */
async function startCamera() {
  showError("");
  if (!navigator.mediaDevices?.getUserMedia) {
    // Browsers only allow camera access on https:// or localhost.
    showError("This page can't use the camera here (it needs https or localhost). Use “Choose image” instead: on a phone it offers “Take photo”.");
    return;
  }
  stopCamera();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
  } catch (err) {
    const denied = err.name === "NotAllowedError" || err.name === "SecurityError";
    showError(denied
      ? "Camera access was blocked. Allow the camera for this site in your browser settings, then try again."
      : err.name === "NotFoundError"
        ? "No camera found on this device. Use “Choose image” instead."
        : "Couldn't start the camera. Another app may be using it.");
    return;
  }
  el.video.srcObject = stream;
  await el.video.play().catch(() => {});
  el.cameraPanel.hidden = false;
}

function stopCamera() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
  el.video.srcObject = null;
  el.cameraPanel.hidden = true;
}

el.cameraBtn.addEventListener("click", startCamera);
el.closeCameraBtn.addEventListener("click", stopCamera);
el.switchBtn.addEventListener("click", () => { facing = facing === "environment" ? "user" : "environment"; startCamera(); });
el.captureBtn.addEventListener("click", () => {
  if (!el.video.videoWidth) return showError("The camera isn't ready yet. Wait a moment and try again.");
  setImageFromSource(el.video, el.video.videoWidth, el.video.videoHeight);
  stopCamera();
});
window.addEventListener("pagehide", stopCamera);

/* ---------- reading ---------- */
async function readWithClaude() {
  setStatus("Reading your handwriting…", null);
  const res = await fetch("/api/ocr", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image: image.canvas.toDataURL("image/jpeg", 0.9) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't read the image. Try again.");
  return data.text;
}

/** Grayscale + stretch contrast so faint or shadowed pages read better offline. */
function enhanceForOcr(src) {
  const c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const hist = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    const g = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000 | 0;
    d[i] = d[i + 1] = d[i + 2] = g;
    hist[g]++;
  }
  const total = d.length / 4;
  let lo = 0, hi = 255, acc = 0;
  while (lo < 255 && (acc += hist[lo]) < total * 0.01) lo++;
  acc = 0;
  while (hi > 0 && (acc += hist[hi]) < total * 0.01) hi--;
  const range = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(255, ((d[i] - lo) * 255) / range));
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

async function readWithTesseract() {
  if (!window.Tesseract) throw new Error("The offline reader couldn't load (it needs internet the first time). Check your connection and reload.");
  setStatus("Starting the offline reader…", 0);
  const worker = await Tesseract.createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") setStatus("Reading text…", m.progress);
      else if (m.status) setStatus(`Preparing (${m.status})…`, m.progress ?? null);
    },
  });
  try {
    const { data } = await worker.recognize(enhanceForOcr(image.canvas));
    return data.text.trim();
  } finally {
    await worker.terminate();
  }
}

el.readBtn.addEventListener("click", async () => {
  if (busy || !image) return;
  busy = true;
  el.readBtn.disabled = true;
  showError("");
  try {
    const text = engine() === "claude" ? await readWithClaude() : await readWithTesseract();
    el.result.value = text;
    el.resultCard.hidden = false;
    el.resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (!text || text === "[no text found]") showError("No text was found. Try a closer, brighter, sharper photo.");
  } catch (err) {
    showError(err.message);
  } finally {
    setStatus("");
    busy = false;
    el.readBtn.disabled = !image;
  }
});

/* ---------- result actions ---------- */
el.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(el.result.value);
  } catch {
    el.result.select();
    document.execCommand("copy");
  }
  const label = el.copyBtn.textContent;
  el.copyBtn.textContent = "Copied";
  setTimeout(() => (el.copyBtn.textContent = label), 1500);
});

el.downloadBtn.addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([el.result.value], { type: "text/plain;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "extracted-text.txt" });
  a.click();
  URL.revokeObjectURL(url);
});

el.clearBtn.addEventListener("click", () => {
  image = null;
  el.preview.hidden = true;
  el.previewImg.removeAttribute("src");
  el.resultCard.hidden = true;
  el.result.value = "";
  el.readBtn.disabled = true;
  showError("");
});

loadConfig();
