"use strict";

var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");

var cors = require("cors");

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

mongoose.connect(process.env.MONGOLAB_URI);
const ShortURL = mongoose.model(
  "ShortURL",
  new mongoose.Schema({
    original_url: {
      type: String,
      required: true,
      unique: true
    },
    short_url: {
      type: Number,
      autoIndex: true,
      unique: true
    }
  })
);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(require("body-parser").urlencoded({ extended: false }));

app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

function _getHostName(url) {
  return require("url").parse(url).host;
}

function _validateDomain(hostname, cb) {
  require("dns").lookup(hostname, (err, ip) => (err ? cb(err) : cb(null, ip)));
}

function _createURL(url, cb) {
  ShortURL.count({})
    .then(index =>
      new ShortURL({ original_url: url, short_url: index })
        .save()
        .then(data =>
          cb(null, {
            original_url: data.original_url,
            short_url: data.short_url
          })
        )
        .catch(err => cb(err))
    )
    .catch(err => cb(err));
}

app.get("/api/shorturl/new", (req, res) => {
  const url = req.query.url;
  const hostname = _getHostName(url);

  hostname
    ? _validateDomain(hostname, (err, ip) =>
        err
          ? res.json({ error: "invalid domain" })
          : _createURL(url, (err, data) =>
              err ? res.json(err) : res.json(data)
            )
      )
    : res.json({ error: "invalid URL" });
});

app.listen(port, function() {
  console.log("Node.js listening ...");
});
