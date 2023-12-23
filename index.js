require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
let bodyParser = require("body-parser");
let mongoose = require("mongoose");
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

app.use(cors());
app.use("/", bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Url = mongoose.model("Url", urlSchema);

app.get("/", function (req, res) {
  res.sendfile(`${__dirname}/views/index.html`);
});
app.post("/api/shorturl", (req, res) => {
  const urlRequest = req.body.url;
  const hostname = urlRequest
    .replace(/http[s]?\:\/\//, "")
    .replace(/\/(.+)?/, "");

  dns.lookup(hostname, (lookupErr, addresses) => {
    if (lookupErr) {
      console.log("lookup() error");
    }
    if (!addresses) {
      res.json({
        error: "invalid URL",
      });
    } else {
      Url.findOne({ original_url: urlRequest })
        .then((urlFound) => {
          if (!urlFound) {
            return Url.estimatedDocumentCount();
          } else {
            return Promise.resolve(urlFound);
          }
        })
        .then((count) => {
          if (typeof count === "number") {
            const newUrl = new Url({
              original_url: urlRequest,
              short_url: count + 1,
            });
            return newUrl.save();
          }
          return Promise.resolve(count);
        })
        .then((result) => {
          if (result instanceof Url) {
            res.json({
              original_url: result.original_url,
              short_url: result.short_url,
            });
          } else {
            res.json({
              original_url: result.original_url,
              short_url: result.short_url,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Server Error");
        });
      // findOne() block
    } // vaid lookup block
  }); // lookup/(block)
}); // post request block
app.get("/api/shorturl/:shorturl", (req, res) => {
  const { shorturl } = req.params;

  Url.findOne({ short_url: shorturl })
    .then((urlFound) => {
      if (!urlFound) {
        res.json({ error: "no matching URL" });
      } else {
        // Perform your update operation here
        // For example, updating a field called 'visited' and redirecting 
        urlFound.visited = true; // Assuming 'visited' is a field in your schema
        return urlFound.save(); // Save the updated document
      }
    })
    .then((updatedUrl) => {
      if (updatedUrl) {
        // Redirect to the original URL after updating
        res.redirect(updatedUrl.original_url);
      }
    })
    .catch((err) => {
      console.log("Error:", err);
      res.status(500).json({ error: "Server Error" });
    });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
