require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const uri =
  "mongodb+srv://eric:baobao123@cluster0.qekfu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
var bodyParser = require("body-parser");
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var id = 0;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const Schema = mongoose.Schema;
var counter = 0;

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const urlSchema = new Schema({
  original_url: { type: String },
  short_url: { type: Number, required: true }
});

const Url = mongoose.model("Url", urlSchema);

// Your first API endpoint
app.get("/api/shorturl/:url", function(req, res) {
  // when taking it in looks in mongoose for url number then posts it
  var num = req.params.url;
  Url.findOne({ short_url: num }, function(err, url) {
    if (err || !url) {
      res.json({ error: "No Url found for the given ShortURL" });
    } else {
      console.log(url);
      res.redirect(302, url.original_url);
    }
  });
});

app.get("/reset", function(req, res) {
  // when taking it in looks in mongoose for url number then posts it
  Url.deleteMany({}, function(err, url) {
    if (err) res.json({ error: "deletion Unsucessful" });
    console.log("deleted");
    res.send("successfully reset");
  });
});

app.post("/api/shorturl", async function(req, res) {
  //html sends a post request which gets picked up here under that path
  //need to parse body.
  var count = await Url.countDocuments({});
  var current = req.body.url.toLowerCase();
  var curr = await Url.findOne({ original_url: current });
  if (curr) {
    res.json({ original_url: curr.original_url, short_url: curr.short_url });
  }
  else if (!isValidHttpUrl(req.body.url)) {
    res.json({ error: 'invalid url' });
  } else {
    var insert = new Url({ original_url: req.body.url, short_url: count });
    insert.save(function(err, data) {
      if (err) console.log("issue here");
      res.json({ original_url: data.original_url, short_url: data.short_url });
    });
  }
}); // got from the form

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
