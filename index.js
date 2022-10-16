require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
// const bodyParser = require('body-parser');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;



app.use(cors());
// app.use(bodyParser.json());
app.use(express.urlencoded());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const dataBase = [];

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;
  const urlObj = new URL(url);
  console.log(urlObj);

  dns.lookup(urlObj.hostname, (error, address, family) => {
    if(error) return res.json({ error: 'invalid url' });
    dataBase.push(url);
    res.json({
      original_url : url,
      short_url: dataBase.length
    });
  });
});

app.get("/api/shorturl/:urlIndex", (req, res) => {
  const urlIndex = req.params.urlIndex;
  if(urlIndex > 0 && urlIndex <= dataBase.length){
    res.redirect(dataBase[urlIndex - 1]);
  }else{
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
