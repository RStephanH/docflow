import express from "express";
import puppeteer from "puppeteer-core";

const app = express();
app.use(express.json({ limit: "2mb" }));

const TOKEN = process.env.PDF_SERVICE_TOKEN;
const NO_SANDBOX = process.env.CHROMIUM_NO_SANDBOX === "true";
let browser; // one shared browser, one fresh page per request

async function getBrowser() {
  if (!browser || !browser.connected) {
    const args = ["--disable-gpu", "--disable-dev-shm-usage"];
    if (NO_SANDBOX) {
      // Trade-off: the container cannot create Chromium's sandbox.
      // Compensated by: JS off, network blocked, non-root, no secrets.
      args.push("--no-sandbox");
    }
    browser = await puppeteer.launch({
      executablePath: "/usr/bin/chromium",
      args,
    });
  }
  return browser;
}

app.post("/render", async (req, res) => {
  if (!TOKEN || req.get("x-service-token") !== TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const { html } = req.body;
  if (typeof html !== "string" || !html) {
    return res.status(400).json({ error: "html is required" });
  }

  let page;
  try {
    const b = await getBrowser();
    page = await b.newPage();

    // Block every network request: only inline content may load
    await page.setRequestInterception(true);
    page.on("request", (r) => {
      const url = r.url();
      if (url.startsWith("data:") || url === "about:blank") {
        return r.continue();
      }
      console.warn("blocked outbound request:", url);
      return r.abort();
    });
    await page.setJavaScriptEnabled(false); // templates need no JS

    await page.setContent(html, { waitUntil: "load", timeout: 15000 });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    res.type("application/pdf").send(Buffer.from(pdf));
  } catch (err) {
    console.error("render failed:", err.message);
    res.status(500).json({ error: "render failed" });
  } finally {
    if (page) await page.close();
  }
});

app.get("/health", (_req, res) => res.send("ok"));
app.listen(3001, () => console.log(`pdf-service on :3001 (sandbox: ${!NO_SANDBOX})`));
