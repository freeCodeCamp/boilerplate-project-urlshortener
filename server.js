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



mongoose.set('useCreateIndex', true);

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  shortUrl: {
    type: Number,
  },
  originalUrl: String,
});

var sURL = mongoose.model('sURL', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

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


  dns.lookup(orgUrl[2], (err, address, family) => {
    if (err) {
      console.log("Error log")
      res.json({ "error": "invalid URL" })
    } else {
      //Add the URL and shortURL in the database
      const shortUrlId = shortUrl();
      console.log("shortUrlId: " + shortUrlId)
      console.log("originalUrl: " + Url)
      var sURL1 = new sURL({ shortURL: shortUrlId, originalUrl: Url })
      sURL1.save(function (err, book) {
        if (err) return console.error(err);
        console.log("test");
        console.log(sURL1.shortUrl + " and " + sURL1.oringialURL + " saved to bookstore collection.");

      })
    }

  })



  //db.URLShort.insertOne({
  // 'url': url,
  //});  

  //res.json({original_url: req.originalUrl});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});

