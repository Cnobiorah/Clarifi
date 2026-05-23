const https = require("https");

module.exports = function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const payload = JSON.stringify(JSON.parse(body));
    const opts = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
    };
    const r = https.request(opts, (s) => {
      let d = "";
      s.on("data", (c) => (d += c));
      s.on("end", () => {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(d);
      });
    });
    r.on("error", (e) => res.status(500).json({ error: e.message }));
    r.write(payload);
    r.end();
  });
};
