'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
const shortid = require('shortid');
const Schema = mongoose.Schema;
var cors = require('cors');

var app = express();
var regTestURL = new RegExp("^(http|https)://", "i");
let regReplace = /^(https|http)?:\/\//i;

// Basic Configuration 
var port = process.env.PORT || 3000;
require('dotenv').config()

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
//URLSchema
const urlSchema = new Schema({url:{'type':String, required:true}, hash:{'type':String, default:shortid.generate}})
//create and save a url
var URL=mongoose.model('URL', urlSchema)
let createAndSaveUrl = function(urlToBeSaved){
  let link = new URL({url:urlToBeSaved});
  link.save(function(err, data){
    if(err) return console.error(err);
    
  })
}

//find a url
let findURL=function(urlTosearchFor){
  URL.find({url:urlTosearchFor})
}
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

//handling post data from the view form
let urlToShorten;
app.post('/api/shorturl/new/', (req, res)=>{
  //retrieve the submitted url from the form post data through body parser
  let submittedURL = req.body.url;
  // console.log(submittedURL);
  //Check if it follows the right format of http||https
  if(regTestURL.test(submittedURL)){
    urlToShorten = submittedURL.replace(regTestURL, '')
    // console.log(`Valid URL ${urlToShorten}`)
  }else{
    return res.json({"error":"invalid URL"})
  }
  // (regTestURL.test(submittedURL)) ? urlToShorten = submittedURL : res.json({"error":"invalid URL"});
  dns.lookup(urlToShorten, (err, address, family)=>{
    if(err==null){
      console.log("Valid")
      createAndSaveUrl(submittedURL);
      console.log("Done")
      let response = findURL(submittedURL);
      return response
    }else{
      console.log(err)
    }
  });
  // I have to look for a way to await the response from mongoose and pass it in to the res.json
  res.json({"original url":response['url'], "short_url":response['hash']})

  
  
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});