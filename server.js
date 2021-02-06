require("dotenv").config();
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(
  "mongodb+srv://dariooliveirajr:1234@freecodecluster.njsf1.mongodb.net/<dbname>?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const UriSchema = new Schema({
  oldUri: { type: String, unique: true },
  newUri: { type: Number, unique: true }
});

const UriModel = mongoose.model("UriModel", UriSchema);

app.get("/api/shorturl/:uri", function (req, res) {
  const newUri = req.params.uri;
  UriModel.findOne({ newUri }, function (err, success) {
    if (err) res.json({ error: "invalid url" });
    res.redirect(success.oldUri.replace("'", "").replace("'", "").trim());
  });
});

app.post("/api/shorturl/new", function (req, res) {
  const oldUri = req.body.url;
  const urlValidator = new URL(oldUri);
  let newUri = 0;
  UriModel.count({}, function (err, count) {
    newUri = parseInt(count) + 1;
    if (urlValidator) {
      UriModel.create({ oldUri, newUri }, function (err, success) {
        if (err) res.json({ error: "invalid url" });
        res.json({
          original_url: success["oldUri"],
          short_url: success["newUri"]
        });
      });
    } else {
      res.json({ error: "invalid url" });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
