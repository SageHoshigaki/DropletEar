const express = require("express");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const app = express();

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
  console.log("Webhook received for DropletEar");
  console.log("Headers:", req.headers);
  console.log("Raw Body:", req.rawBody);
  console.log("Parsed Body:", req.body);

  if (req.headers["x-github-event"] === "push") {
    exec(
      "cd /root/projects/DropletEar && git pull origin main && pm2 restart webhook-listener",
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error pulling changes: ${stderr}`);
          return res.sendStatus(500);
        }
        console.log(`Pulled latest changes for DropletEar: ${stdout}`);
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

const port = 5000;
app.listen(port, () => {
  console.log(`Webhook listener for DropletEar running on port ${port}`);
});

//checking change
