require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const isUrlHttp = require("is-url-http");
const dns = require("dns");
const urlParser = require("url");
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

//middleware to parse json data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//connect to the mongodb database
mongoose.connect(process.env.DB_URL,{useUnifiedTopology: true });

//define a URL schema
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});

//create a URL model
const UrlModel = mongoose.model('Url', urlSchema);


app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// endpoint to create a short url
app.post('/api/shorturl', async function (req, res) {
  try {
    const originalUrl = req.body.url;
    console.log(originalUrl);

    // Check if the original URL is valid or not
    const dnsLookupPromise = new Promise((resolve) => {
      dns.lookup(urlParser.parse(originalUrl).hostname, (err, address) => {
        if (err || !address) {
          resolve(false); // Resolve with false if invalid URL
        } else {
          resolve(true); // Resolve with true if valid URL
        }
      });
    });

    const isValidUrl = await dnsLookupPromise;

    if (!isValidUrl) {
      return res.json({ error: "invalid url" });
    }

    const shortUrl = generateShortUrl();

    // Save this new URL to the database
    const newUrl = new UrlModel({ original_url: originalUrl, short_url: shortUrl });
    await newUrl.save();

    res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    const shortUrl = req.params.short_url;

    // Look up the original URL associated with the short_url in your database
    const originalUrl = await findOriginalUrl(shortUrl);

    if (originalUrl) {
      // Redirect the user to the original URL
      return res.redirect(originalUrl);
    } else {
      return res.status(404).json({ error: "Short URL not found" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//generate a random short url
function generateShortUrl() {
  console.log("hello");

  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 6;
  let shortUrl = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    shortUrl += alphabet[randomIndex];
  }
  return shortUrl;
}

async function findOriginalUrl(shortUrl) {
  console.log("hello")
  try {
    //search for the shortUrl in the database
    const foundShortUrl = await UrlModel.findOne({short_url: shortUrl});

    if(foundShortUrl) {
      console.log("found");
      //if the shortUrl is found, return the associated original URL
      return foundShortUrl.original_url;
    } else {
      //if the shortUrl is not found, throw an error
      throw new Error('short URL not found'); 
    }
  } catch (error) {
    //handle any errors that occur during the database search
    console.log(error);
  }
}

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
