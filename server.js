'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');

const { connectToMongoose } = require('./db');
const Url = require('./model/url');

const app = express();
const port = process.env.PORT || 3000;


connectToMongoose();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json())


app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get('/api/shorturl/:id', (req, res) => {
  const short = req.params.id
  Url.findOne({ short }).exec()
    .then((url) => {
      if (url) {
        return res.writeHead(302, {
          'Location': url.original
        })
      }
      console.log(`Printing- - - - res:`, res)
      return res.redirect('/error.html')
    })
    .catch((error) => {
      console.log("error", error)
      return res.redirect('/index.html')
    })
  
});

app.get('')

app.post('/api/shorturl/new', (req, res) => {
  dns.lookup(req.body.url, (error, address) => {1
    if (error) {
      return res.status(400).json({
        error: "invalid URL"
      });
    }

    Url.estimatedDocumentCount().exec((error, count) => {
      if (error) {
        res.status(500).send(error)
      }
      const currentCount = count + 1
      const url = new Url({
        original: req.body.url,
        short: currentCount
      })

      url.save()
        .then(() => {
          res.status(200).json({
            "original_url": url,
            "short_url": 1
          });
        })
        .catch((error) => {
          res.status(500).send(error)
        })

    });
  });
});


app.listen(port, function () {
  console.log(`Node.js listening to port ${port}...`);
});