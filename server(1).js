// server.js
const express = require("express");
const fetch = require("node-fetch");
const { URL } = require("url");
const app = express();

// Optional: Serve static frontend if you want to include index.html in the same project
// app.use(express.static("public"));

// ----------------- Proxy Endpoint -----------------
app.get("/proxy", async (req, res) => {
  try {
    const target = req.query.url;
    if (!target) return res.send("No URL provided");

    const base = new URL(target);

    const response = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    let html = await response.text();

    // Rewrite links/assets to go through this proxy
    html = html.replace(/(href|src)=["'](.*?)["']/gi, (m, attr, link) => {
      try {
        const absolute = new URL(link, base).href;
        return `${attr}="/proxy?url=${encodeURIComponent(absolute)}"`;
      } catch {
        return m;
      }
    });

    // Remove Content-Security-Policy so scripts can run
    res.removeHeader("Content-Security-Policy");

    res.send(html);
  } catch (err) {
    res.status(500).send("Proxy Error: " + err.message);
  }
});

// ----------------- Listen on Render port -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GX Browser Proxy running on port ${PORT}`));