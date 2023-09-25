require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
var validator = require("validator");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    unique: true,
  },
  shortUrl: {
    type: Number,
    required: true,
    unique: true,
    default: 1,
  },
});
let Url = mongoose.model("Url", urlSchema);

app.use("/", bodyParser.urlencoded({ extended: false }));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
  if (validator.isURL(req.body.url)) {
    Url.findOne({ originalUrl: req.body.url }).then((doc) => {
      if (doc) {
        res.json({
          original_url: doc.originalUrl,
          short_url: doc.shortUrl,
        });
      } else {
        Url.find()
          .count()
          .exec()
          .then((numDoc) => {
            var shortUrl = numDoc + 1;
            var url = new Url({
              originalUrl: req.body.url,
              shortUrl: shortUrl,
            });
            url
              .save()
              .then((doc) => {
                res.json({
                  original_url: doc.originalUrl,
                  short_url: doc.shortUrl,
                });
              })
              .catch((err) => {
                console.error(err);
              });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:short_url", function (req, res) {
  Url.findOne({ shortUrl: req.params.short_url })
    .then((url) => res.redirect(url.originalUrl))
    .catch((err) => console.error(err));
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
