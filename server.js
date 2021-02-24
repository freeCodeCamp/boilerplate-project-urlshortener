require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

let urlArray = [];

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl/new', urlencodedParser, function(req, res) {
  let {url} = req.body;
  // remove http, https, etc. from address
  let regex = /^\w+(:\/\/)+/g;
  url = url.replace(regex, '');
  let shorturl = urlArray.length + 1;
  dns.lookup(url, function(err, addresses, family) {
    if(err) {
      res.json({error : 'invalid url'});
    } else {
      let temp = {'original_url' : url, 'short_url': shorturl};
      urlArray.push(temp);
      res.json(temp);
    }
  });

});

app.get('/api/shorturl/:shorturl', function(req, res) {
  let {shorturl} = req.params;
  let urlObj = urlArray.find(elem => elem.short_url == shorturl);

  res.redirect('https://' + urlObj.original_url);
  
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
