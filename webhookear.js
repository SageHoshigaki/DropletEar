const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  if (req.headers["x-github-event"] === "push") {
    exec(
      "cd /root/projects/PuppetMicro && git pull origin main && npm install && pm2 restart puppeteer-service",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error pulling changes: ${stderr}`);
          return res.sendStatus(500);
        }
        console.log(`Pulled latest changes: ${stdout}`);
        return res.sendStatus(200);
      }
    );
  } else {
    return res.sendStatus(400);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Webhook listener running on port ${port}`);
});
