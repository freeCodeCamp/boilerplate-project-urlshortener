require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const dns = require("dns");
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let uSchema = new mongoose.Schema({
  orig: { type: String, required: true },
  short: Number,
});

let Urlshort = mongoose.model("Urlshort", uSchema);

let resObj = {};

app.post(
  "/api/shorturl",
  bodyParser.urlencoded({ extended: false }),
  (request, response) => {
    let inurl = request.body["url"];
    let uRegex = new RegExp(
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
    );
    if (!inurl.match(uRegex)) {
      response.json({ error: "invalid url" });
    }
    resObj["original_url"] = inurl;
    let inshort = 1;
    Urlshort.findOne({})
      .sort({ short: "desc" })
      .exec((error, output) => {
        if (!error && output != undefined) {
          inshort = output.short + 1;
        }
        if (!error) {
          Urlshort.findOneAndUpdate(
            { orig: inurl },
            { orig: inurl, short: inshort },
            { new: true, upsert: true },
            (error, output) => {
              if (!error) {
                resObj["short_url"] = output.short;
                response.json(resObj);
              }
            }
          );
        }
      });
  }
);

app.get("/api/shorturl/:input", (request, response) => {
  let input = request.params.input;
  Urlshort.findOne({ short: input }, (error, output) => {
    if (!error && output != undefined) {
      response.redirect(output.orig);
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
