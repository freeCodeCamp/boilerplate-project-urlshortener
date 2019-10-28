'use strict';
require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var cors = require('cors');
var validUrl = require('valid-url');
const dns = require('dns');
var URL = require('url');



var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

autoIncrement.initialize(db);


var schema = new mongoose.Schema({
     originalUrl: String
    // shortUrl: String
});
 
var urlModel = mongoose.model('Url', schema);
schema.plugin(autoIncrement.plugin, {model: 'Url', field: 'shortUrl' });


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

function lookupAsPromise(domain){
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address, family) => {
        if(err) reject(err);
        resolve(address);
    });
  });
}

app.post('/api/shorturl/new', async (req, res)=>{
    
  try{
      let url = req.body.url;
      
      if (!validUrl.isUri(url)){
        return res.json({"error":"invalid URL"});        
      }
    
      let domain = URL.parse(url).hostname;
    
      await lookupAsPromise(domain);
      console.log('wtf')
      let urlDoc = await urlModel.find({originalUrl: url});
      console.log('wrd')
      if(urlDoc !== null){
        console.log(urlDoc)
         return res.json(urlDoc);
      }
    
      let newDoc = new urlModel({originalUrl: url});
    
      let savedDoc = await newDoc.save();
    
      return res.json(savedDoc);
    
  }catch(error){
    console.log(error);
     return res.json({"error":"invalid URL"});
  }


})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});