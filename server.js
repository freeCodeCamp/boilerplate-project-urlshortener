//require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

//create database document
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Schema = mongoose.Schema;
const urlSchema = new Schema ({
  url: String  
});

const Url = mongoose.model("Url", urlSchema);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//modifying the url for DNS
var urlForDns = function(url) {
  let urlToDsn;  
  let urlProtocol = url.split('//')[0];
  if (urlProtocol == "https:"|| urlProtocol=="http:") {
    let address = url.split('//')[1];
    address = address.split('/')[0];
    let domain = address.replace("www.", "");
    urlToDsn= domain; 
  } else {
    urlToDsn= "invalid";
  }
    return urlToDsn;
}

//Input
app.post('/api/shorturl', function(req, res) {
  var url = req.body.url;  
  var urlDns = urlForDns(url);    
  dns.lookup(urlDns, (err) => {
    if (err) {
        res.json({
          error: 'invalid url'        
        })
    } else {
      var urlRecord = new Url({url: url});
      urlRecord.save(function(err, data){
        if(err) return res.json({error: 'DB operation failed'});
        else return res.json({original_url: url, short_url: data._id.toString()});
      })
    }
  })      
});

//output
app.get('/api/shorturl/:shorturl', (req, res) => {
  let urlID = req.params.shorturl;
  Url.findById(urlID, (err, data)=> {
    if (err) {
      res.json({error :"invalid url"});
    } //else {
      //res.redirect(data.url); 
    //}
    return res.redirect(data.url)    
  })
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
