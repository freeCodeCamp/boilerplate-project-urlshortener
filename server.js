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
    originalUrl: String,
    shortUrl: Number
});
 
schema.plugin(autoIncrement.plugin, {model: 'Url', field: 'shortUrl' });
var urlModel = mongoose.model('Url', schema);



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

        let urlDoc = await urlModel.findOne({originalUrl: url}, {});

        if(urlDoc !== null){

            let responseData = {
                original_url: urlDoc.originalUrl,
                short_url: urlDoc.shortUrl
            }

            return res.json(responseData);
        }
    
        let newDoc = new urlModel({originalUrl: url});

        let savedDoc = await newDoc.save();

        let responseData = {
            original_url: savedDoc.originalUrl,
            short_url: savedDoc.shortUrl
        }
    

        return res.json(responseData);
    
    }catch(error){
        console.log(error);
        return res.json({"error":"invalid URL"});
    }

})

app.get('/api/shorturl/:id', async (req,res) =>{

    try{

        let id = req.params.id;
        let doc = await urlModel.findOne({shortUrl: id}).lean();

        if(doc == null){
            return res.json({"error":"that url does not exist"});
        }

        return res.redirect(doc.originalUrl);

    }catch(error){
        return res.json({"error":"something went wrong"});
    }
})

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});