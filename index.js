require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("node:dns");
const shortid = require("shortid");

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Successfully Connected To Database");
    },
    (err) => {
      console.log("connection error: ", err);
    }
  );

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// create url schema
const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  short_url: {
    type: String,
    default: shortid.generate,
  },
});

// create mongoose model
const urlModel = mongoose.model("url-shorteners", urlSchema);

// Define a errorMessage
const errorMessage = { error: "Invalid URL" };

// Define a function to craete a new URL obj from a url string
const createdURL = (givenURL) => {
  try {
    return new URL(givenURL);
  } catch (e) {
    if (e instanceof TypeError) {
      return errorMessage;
    }
  }
};

// Your first API endpoint
app.post("/api/shorturl", async function (req, res) {
  const reqURL = req.body.url;
  // check if the input url is new or existed
  const findUrlResult = await urlModel.findOne({ original_url: reqURL });
  if (findUrlResult == null) {
    if (createdURL(reqURL) !== errorMessage) {
      dns.lookup(createdURL(reqURL).hostname, (err, address) => {
        if (err || !address) {
          res.json(errorMessage);
        } else {
          const newUrl = new urlModel({ original_url: reqURL });
          newUrl.save();
          res.json({ original_url: reqURL, short_url: newUrl.short_url });
        }
      });
    } else {
      res.json(errorMessage);
    }
  } else {
    res.json({ original_url: reqURL, short_url: findUrlResult.short_url });
  }
});

app.get("/api/shorturl/:shorturl", async (req, res) => {
  const shorturl = await urlModel.findOne({ short_url: req.params.shorturl });
  if (shorturl == null) return res.json(errorMessage);
  res.redirect(shorturl.original_url);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
