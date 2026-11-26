# Read my writing (OCR)

A small web app that reads handwriting or printed text from your **camera** or an **image** and gives you the text to copy or download.

It lives in its own folder and doesn't touch the store or admin apps.

## Run it

Requires Node.js 20 or newer. There is nothing to install.

```bash
cd ocr
cp .env.example .env     # then paste your key into ANTHROPIC_API_KEY
npm start                # http://127.0.0.1:3100
```

## Two ways to read

| Method | Good for | Needs |
| --- | --- | --- |
| **Handwriting** (Claude) | Handwriting, messy notes, mixed handwriting and print | An Anthropic API key in `.env`. Each read uses a little API credit. |
| **Printed text, offline** (Tesseract.js) | Clean printed text, screenshots | Internet the first time only, to download the reader. Runs in the browser, free. |

Offline OCR is poor at handwriting. That is why the handwriting method uses Claude. The key stays on the server and is never sent to the browser.

## Getting an image

- **Open camera**: live preview, then *Take photo*. *Switch camera* flips between front and back.
- **Choose image**: on a phone this also offers *Take photo*.
- Drag and drop an image, or paste one with Ctrl/⌘+V.

Browsers only allow the camera on `https://` or `localhost`. If you open the app from your phone over plain `http://192.168…`, the camera button explains this; use *Choose image* instead, or serve the app over HTTPS (for example with a tunnel such as `cloudflared`).

## Tips for good results

Bright even light, the page filling the frame, no shadow across the writing, phone held still and parallel to the page.

## Settings (`.env`)

| Variable | Default | |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | none | Enables the handwriting method |
| `OCR_MODEL` | `claude-sonnet-5-5` | Any Claude model that accepts images |
| `PORT` | `3100` | |
| `HOST` | `127.0.0.1` | Keep this on localhost. Anyone who can reach the server can use your API credit. |

## Tests

```bash
npm test
```

The server tests use a fake Anthropic API, so they cost nothing.
