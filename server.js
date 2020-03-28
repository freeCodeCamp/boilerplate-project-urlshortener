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
let findURL= function(urlTosearchFor){
  const result = URL.findOne({url:urlTosearchFor});
  return result
}
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
const bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({extended:true}));

//handling post data from the view form
let urlToShorten;
let linksArray = [];
let id=0;
app.post('/api/shorturl/new/', (req, res)=>{
  //retrieve the submitted url from the form post data through body parser
  let submittedURL = req.body.url;
  //Check if it follows the right format of http||https
  if(regTestURL.test(submittedURL)){
    urlToShorten = submittedURL.replace(regTestURL, '')
  }else{
    return res.json({"error":"invalid URL"})
  }
  
  dns.lookup(urlToShorten, (err, address, family)=>{
    if(err==null){
      console.log("Valid")
      id++;
      let linkObject={"original_url":submittedURL,"short_url":`${id}`};
      linksArray.push(linkObject);
      res.json(linkObject)
      console.log(linksArray)
    }else{
      console.log(err)
      return res.json({"error":"invalid URL"})
    }
  }); 
})
//when short url is visited
app.get("/api/shorturl/:id", (req, res)=>{
  //get the given id from the request
  let id = req.params.id;
  console.log(id)
  //Find it in the array
  let found=linksArray.find(link =>link.short_url === id);
  console.log(found)
  //redirect to the url
  if(found){
    res.redirect(found.original_url)
  }else{
    res.json({"error":`Url with the short id ${id} not found`})
  }
});
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