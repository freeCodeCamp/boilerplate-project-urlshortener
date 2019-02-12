'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var url = require('url');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// Connect to MongoDB:
process.env.MONGOLAB_URI="mongodb+srv://muser:muser@cluster0-eoh8c.mongodb.net/urlShortener?retryWrites=true";
mongoose.connect(process.env.MONGOLAB_URI);

// Create Schema:
var urlSchema = new mongoose.Schema({
  "original_url": { type: String, unique: true, required: true },
  "short_url": { type: Number, required: true }
});

// Create Model:
var UrlModel = new mongoose.model('Url', urlSchema);

// Regex for testing urls:
// Source: https://www.regextester.com/94502
let urlReg = /^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

app.use(cors());

// Mount the body-parser:
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get("/api/shorturl/:url", function(req, res) {
  UrlModel.findOne({"short_url": req.params.url}, function(err, doc) {
    return res.status(301).redirect(doc.original_url);
  });
});

app.post("/api/shorturl/new", function(req, res) {
  // Get the new url:
  let new_url = req.body.url;
  let hostname = url.parse(new_url).hostname;
  
  // Check the url format:
  if(!urlReg.test(new_url))
    return res.json({"error": "invalid URL"});
  
  // Check if the url is from a valid domain:
  dns.lookup(hostname, function(err, records) {
    // Return error if the url is invalid:    
    if(err)
      return res.json({"error": "invalid URL"});
    
    // Check if the url has been shortened:
    UrlModel.findOne({"original_url": new_url}, function(err, doc) {
      
      // If it isn't registered:
      if(doc == null) {
        // Get the next short url:
        UrlModel.count({}, function(err, count) {
          // Create the new url:
          let newDoc = new UrlModel({"original_url": new_url, "short_url": count + 1});
          
          // Save the new url:
          newDoc.save(function(err, doc) {
            // Send response to the client:
            return res.json({
              "original_url": new_url,
              "short_url": doc.short_url
            });
          });
        });
      }
      // There is a register of the same url:
      else
        return res.json({ "original_url": new_url, "short_url": doc.short_url });
    });
  });
});

app.listen(port);