const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();

// Middleware to log raw body
app.use((req, res, next) => {
  let data = "";
  req.on("data", (chunk) => {
    data += chunk;
  });
  req.on("end", () => {
    req.rawBody = data;
    next();
  });
});

app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  console.log("Webhook received");
  console.log("Headers:", req.headers);
  console.log("Raw Body:", req.rawBody);
  console.log("Parsed Body:", req.body);

  if (req.headers["x-github-event"] === "push") {
    exec(
      "cd /root/projects/DropletEar && git pull origin main && pm2 restart webhook-listener && cd /root/projects/PuppetMicro && git pull origin main && npm install && pm2 restart puppeteer-service",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error pulling changes: ${stderr}`);
          return res.sendStatus(500);
        }
        console.log(`Pulled latest changes: ${stdout}`);
        res.sendStatus(200);
      }
    );
  } else {
    res.sendStatus(400);
  }
});

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Bad JSON:", err);
    return res.status(400).send({ error: "Invalid JSON" });
  }
  next();
});

const port = 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Webhook listener running on port ${port}`);
});
