require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}))

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// the keys in this are the original urls and the values are the shortened urls
const urlShortenedKeys = new Map();
// the keys in this are the shortened urls and the values are the original urls
const shortenedKeysUrl = new Map();


app.post('/api/shorturl', (req, res) => {
  var url = req.body.url;
  
  if (validURL(url)) {

    if (!(urlShortenedKeys.has(url))) {
      var newIndex = urlShortenedKeys.size + 1;
      urlShortenedKeys.set(url, newIndex);
      shortenedKeysUrl.set(newIndex, url);
    }
  
    var url_shortened_index = urlShortenedKeys.get(url);
    res.json({
      original_url: url,
      short_url: url_shortened_index
    });

  }
  else {
    res.json(
      {"error":"Invalid URL"}
    );
  }

})

app.get('/api/shorturl/:short', (req, res) => {
  var shortUrl = +req.params.short;

  if (shortenedKeysUrl.has(shortUrl)) {
    var url = shortenedKeysUrl.get(shortUrl);
    res.redirect(url);
  }
  else {
    res.json({
      "error":"No short URL found for the given input"
    });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
