require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const validator = require("validator");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//import parser, dns, url
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");
app.use(bodyParser.urlencoded({ extended: true }));

//Shortened url id
let id = 0;
//Save the url to this obj
let urlDatabase = {};

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;
 
  // check if valid url format
  const httpRegex = /^(http|https)(:\/\/)/;
  if (!httpRegex.test(originalUrl)) {
    return res.json({ error: "invalid url" });
  }
  // check valid protocol
  if (!validator.isURL(originalUrl, { require_protocol: true, require_tld: true })) {
    res.status(400).send({ error: "invalid url" });
    return;
  }
  const urlObj = url.parse(originalUrl);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      res.status(400).send({ error: "invalid url" });
    } else {
      const shortUrl = ++id;
      urlDatabase[shortUrl] = originalUrl;

      res.json({
        original_url: originalUrl,
        short_url: shortUrl,
      });
    }
  });
});

//Direct to the page
app.get("/api/shorturl/:short_url", function (req, res) {
  const shortLink = req.params.short_url;

  if (urlDatabase[shortLink]) {
    res.redirect(urlDatabase[shortLink]);
  } else {
    res.status(404).send({ error: "invalid url" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
