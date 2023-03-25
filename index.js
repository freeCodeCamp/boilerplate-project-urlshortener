require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// parse form data
app.use(express.urlencoded({ extended: false }));
// parse json
app.use(express.json());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

/* ***************************
 * project-solution-code *****
 *****************************/

const { URL } = require("url");
const { v4: uuidv4 } = require("uuid");

const mongoose = require("mongoose");

// Define Schema
const UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: String,
    required: true,
  },
});

// Compile model from schema
const Url = mongoose.model("Url", UrlSchema);

function isValidUrl(string) {
  try {
    const url = new URL(string);
    if (url.protocol != "http:" && url.protocol != "https:") {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return false;
  }
}

app.post("/api/shorturl", async (req, res) => {
  if (!isValidUrl(req.body.url)) {
    return res.json({
      error: "invalid url",
    });
  } else {
    const url = await Url.findOne(
      { original_url: req.body.url },
      "-_id original_url short_url"
    );
    if (!url) {
      const short_url = uuidv4();
      let newUrl = await Url.create({
        original_url: req.body.url,
        short_url: short_url,
      });
      return res.status(201).send({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url,
      });
    }
    return res.status(201).send(url);
  }
});

app.get("/api/shorturl/:url", async (req, res) => {
  const url = await Url.findOne({ short_url: req.params.url });
  if (!url) {
    return res.status(404).json({ msg: "Not found." });
  }
  return res.redirect(url["original_url"]);
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(port, function () {
      console.log(`Listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
