'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cors = require('cors');
const dns = require('dns')
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
});

const urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true},
  shortcut_url: {type: String, required: true}
});

const shortURL = mongoose.model('shortURL', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyparser.urlencoded({extended: false}))

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//url shortner
app.post('/api/shorturl/new', (req,res,next)=>{
  
  let url = new URL(req.body.url).host;

  function randomNum() {
    let min = 0;
    let max = 50;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  };
  let num = randomNum();

  dns.lookup(url, (err,address,family)=>{
    //check if valid url
    if(err){
      console.log(err);
      res.json({"error": 'Invalid URL'});
    }
    //else url is valid
    else{
      //search for URL in db
      shortURL.findOne({"original_url": req.body.url},
      (err,foundURL)=>{
        if(err) console.log(err);
        //if URL exists in db, serve the doc as json
        if(foundURL){
          console.log('Document for this URL already exists.');
          res.json({
            "original_url": foundURL.original_url,
            "shortcut_url": foundURL.shortcut_url
          });
        }
        //if no URL found, serve json and save document
        else{
          //create document instance for every valid url
          let createURLDoc = new shortURL({
            "original_url": req.body.url,
            "shortcut_url": num
          });
          res.json({
            "original_url": req.body.url,
            "shortcut_url": num 
          });
          createURLDoc.save();
        }
      })

    }
  });
});

app.get('/api/shorturl/:new', (req,res,next)=>{
  
  let url = req.params.new;
  
  shortURL.findOne({"shortcut_url": url},
  (err, foundURL)=>{
    if(err) console.log(err);
    if(foundURL){
      res.redirect(foundURL.original_url);
    }
    else{
      res.json({"error": "invalid URL"})
    }
  });
  
})
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});