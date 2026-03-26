const express = require("express");
const fetch = require("node-fetch");
const { URL } = require("url");

const app = express();

app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.send("No URL");

    const base = new URL(target);

    const response = await fetch(target, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    let html = await response.text();

    // 🔥 Rewrite links + assets
    html = html.replace(/(href|src)=["'](.*?)["']/gi, (m, attr, link) => {
      try {
        const absolute = new URL(link, base).href;
        return `${attr}="/proxy?url=${encodeURIComponent(absolute)}"`;
      } catch {
        return m;
      }
    });

    // Remove CSP (helps scripts run)
    res.removeHeader("Content-Security-Policy");

    res.send(html);

  } catch (err) {
    res.status(500).send("Proxy Error: " + err.message);
  }
});

app.listen(3000, () => console.log("Proxy running"));