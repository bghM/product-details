const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.proxyAliExpress = functions.https.onRequest(async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow"
    });

    const html = await response.text();
    res.set("Content-Type", "text/html");
    return res.send(html);
  } catch (err) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});