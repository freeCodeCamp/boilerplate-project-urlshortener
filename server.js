require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const UrlModel = require('./models/Url');
const http = require('http')
const bodyParser = require('body-parser');
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 4000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.use(cors());
app.listen(port);
app.use('/public', express.static(`${process.cwd()}/public`));

let alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
mongoose.connect("mongodb+srv://osalam:11QQWPEE31mxdSAR@cluster0.kqvok.mongodb.net/UrlShorter?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })

function getRandomUrl(longUrl=""){
    let iteration = longUrl.length%alphaNumeric.length;
    let shortUrl="";

    for(let i=0;i<iteration;i++){

        shortUrl+=alphaNumeric.charAt(Math.floor(Math.random()*62+0));

    }

    return (shortUrl);
    
    
}

function validateUrl(req,res,next){
    let regex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
    if(!regex.test(req.body.url)){
        return res.json({ error: 'invalid url' });
    }else{
        next();
    }
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl',validateUrl,function(req,res){
  let {url} = req.body;
  let objectSave = {
    original_url:url,
      short_url:getRandomUrl(url)
  }
  UrlModel.create(objectSave,function(error,data){
      if(error) throw error;
      let responseObjet = {
          original_url:data.original_url,
          short_url:data.short_url
      }
      return res.json(responseObjet);
  })
 
})

app.get('/api/shorturl/:short_url',function(req,res){
    
  let {short_url} = req.params;
  UrlModel.findOne({short_url})
  .exec(function(error,data){
      if(error) throw error;
      return res.redirect(301,`${data.original_url}`);
  })
}) 