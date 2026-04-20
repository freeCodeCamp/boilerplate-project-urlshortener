require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

const shortUrlMap = new Map();
const originalUrlMap = new Map();
let counter = 1;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>URL Shortener Microservice</title>
      </head>
      <body>
        <h1>URL Shortener Microservice</h1>
        <form action="/api/shorturl" method="POST">
          <input
            type="text"
            name="url"
            placeholder="https://example.com"
            required
          />
          <button type="submit">Shorten URL</button>
        </form>
      </body>
    </html>
  `);
});

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

app.post('/api/shorturl', (req, res) => {
  const submittedUrl = req.body.url;

  if (!submittedUrl || !isValidHttpUrl(submittedUrl)) {
    return res.json({ error: 'invalid url' });
  }

  let hostname;
  try {
    hostname = new URL(submittedUrl).hostname;
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    if (originalUrlMap.has(submittedUrl)) {
      return res.json({
        original_url: submittedUrl,
        short_url: originalUrlMap.get(submittedUrl)
      });
    }

    const shortId = counter++;
    shortUrlMap.set(shortId.toString(), submittedUrl);
    originalUrlMap.set(submittedUrl, shortId);
    
    return res.json({
      original_url: submittedUrl,
      short_url: shortId
    });
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortId = req.params.short_url;

  const originalUrl = shortUrlMap.get(shortId);

  if (!originalUrl) {
    return res.json({ error: 'invalid url' });
  }

  return res.redirect(302, originalUrl);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});