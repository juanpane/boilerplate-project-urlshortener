require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { URL } = require("url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));

const urlDatabase = [];
let nextId = 1;

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;
  if (!originalUrl || !/^https?:\/\//i.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }
  let hostname;
  try {
    hostname = new URL(originalUrl).hostname;
  } catch (e) {
    return res.json({ error: "invalid url" });
  }
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
    const existing = urlDatabase.find(
      (item) => item.original_url === originalUrl
    );
    if (existing) {
      return res.json({
        original_url: existing.original_url,
        short_url: existing.short_url,
      });
    }
    const entry = { original_url: originalUrl, short_url: nextId };
    urlDatabase.push(entry);
    nextId += 1;
    res.json(entry);
  });
});

app.get("/api/shorturl/:id", function (req, res) {
  const id = Number(req.params.id);
  const entry = urlDatabase.find((item) => item.short_url === id);
  if (!entry) {
    return res
      .status(404)
      .json({ error: "No short URL found for the given input" });
  }
  res.redirect(entry.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
