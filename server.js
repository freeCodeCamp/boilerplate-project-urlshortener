'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var dns = require('dns');

var db = mongo.db;

var cors = require('cors');

var app = express();

//Short Url will be numeric
const shortUrl = () => {
  return Math.floor(Math.random() * 20000)
}


// Basic Configuration 
var port = process.env.PORT || 3000;



/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);
//Connect to Mongo Atlas DB


/*
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

(async function () {
  // Connection URL
  const url = 'mongodb://localhost:27017/URLShort';
  // Database Name
  const dbName = 'URLShort';
  const client = new MongoClient(url, { useNewUrlParser: true });

  try {
    // Use connect method to connect to the Server
    await client.connect();

    const db = client.db(dbName);
  } catch (err) {
    console.log(err.stack);
  }

})();
*/


mongoose.connect('mongodb://localhost:27017/URLShort', { useNewUrlParser: true }, (err) => {
  if (!err) { console.log('MongoDB Connection Succeeded.') }
  else { console.log('Error in DB connection: ' + err) }
})


mongoose.set('useCreateIndex', true);

//Database Schema
const Schema = mongoose.Schema;

var urlSchema = new Schema({
  shortUrl: {
    type: Number,
  },
  originalUrl: String,
});

//Database Model
var URL = mongoose.model('URLShort', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/:shorturl/", function (req, res) {
  console.log("shorturl is " + req.params.shorturl)
  URL.find({ shortUrl: req.params.shorturl }, 'originalUrl shortUrl', function (err, docs) {
    if (!err) {
      console.log(docs);
    } else {
      res.send('There is no url for ' + req.params.shorturl)
    }
  })
})

// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res, next) {
  //req.route.path
  // if (!req.body) {
  //  return res.status(400).send('Request body is missing')
  //}

  //Getting the main path and about to remove additional routes
  var Url = req.body.url;

  console.log(Url.split(/\/{1}/))
  //Taking the whole url spliting between /
  var orgUrl = Url.split(/\/{1}/);
  var shortUrlId = shortUrl();

  dns.lookup(orgUrl[2], (err, address, family) => {
    console.log(address)
    if (err || address === '92.242.140.2') {
      console.log("Error log")
      res.json({ "error": "invalid URL" })
    } else {
      //Add the URL and shortURL in the database
   
      console.log("shortUrlId: " + typeof shortUrlId)
      console.log("originalUrl: " + typeof Url)

      //Search database and find if url is already in system and if so return the results
      URL.find({ originialUrl: Url }, 'originalUrl shortUrl', function (err, person) {
        if (!err) {
          res.send('Theres is already an urlshortener for ' + Url + ' and can be access by using [this_project_url]/api/shorturl/' + shortUrlId)
        }
      })

      var Url1 = new URL({ shortUrl: shortUrlId, originalUrl: Url })
 
        Url1.save(Url1, function (err) {
          if (err) { return console.error(err) }
          console.log(Url1.shortUrl)
        })
    }
  })

  res.send('The ' + Url + ' can be access by using [this_project_url]/api/shorturl/' + shortUrlId)



  //db.URLShort.insertOne({
  // 'url': url,
  //});  

  //res.json({original_url: req.originalUrl});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

