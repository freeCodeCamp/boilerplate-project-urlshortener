require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

let urlDatabase = [];
let urlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;
  
  const urlPattern = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
  if (!urlPattern.test(url)) {
    return res.json({ error: 'invalid url' });
  }
  
  const urlObj = new URL(url);
  const host = urlObj.hostname;

  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    const shortUrl = urlCounter++;
    urlMappings[shortUrl] = url;
    
    res.json({
      original_url: url,
      short_url: shortUrl
    });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url, 10);
  const originalUrl = urlMappings[shortUrl];
  
  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
