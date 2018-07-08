'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
const dns = require('dns');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use("/", bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// DB Settings
var Schema = mongoose.Schema;
var urlSchema = new Schema({
  short_url: Number,
  original_url: String
}, { collection: 'short_urls' });
var URL = mongoose.model('RUL', urlSchema);

// API Settings
app.post('/api/shorturl/new', (req, res, next) => {
  var url = req.body.url;
    
  dns.lookup(url.replace(/^https?:\/\//, ""), (err, address, family) => {
    if (err) {
      res.json({ error: "invalid URL" });
    } else {
      URL.findOne({ "original_url": url }).select("-_id -__v").exec((err, data) => {
        if (err) {
          return console.log(err);
        } else {
          if (data) {
            res.json(data);
          } else {
            URL.findOne().sort('-short_url').exec((err, data) => {
              if (err) return console.log(err);

              req.res = {
                short_url:    data.short_url + 1,
                original_url: url
              };

              URL.create(req.res, function (err, awesome_instance) {
                if (err) return console.log(err);

                res.json(req.res);
              });
            });
          }
        }
      });
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});