'use strict';

var dns = require('dns');
var url = require('url');

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI)

var SequenceSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  id: {type: Number, required: true, unique: true}
});
var SequenceModel = mongoose.model('sequence', SequenceSchema);

var urlPairSchema = new mongoose.Schema({
  id: {type: Number, required: true, unique: true},
  href: {type: String, required: true, unique: true}
});  
var urlPairModel = mongoose.model('urlPair', urlPairSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


/*******************************************************************************
URL Shortener Microservice
*******************************************************************************/

// URL Validation Function
var validateFQDN = function(req, res, callback) {
  
  var originalURL = url.parse(req.params.original_url);
  var FQDN = originalURL.host;
  
  dns.lookup(FQDN, function(err, addr, family) {
    if (err) {
      console.log('!!! Validating FQDN Done, FQDN is invalid: ', FQDN);
      res.json( {errro: 'invalid URL'} );
    } else {
      console.log('Validating FQDN Done, FQDN is valid.');
      callback(req, res);  // Add URL pair into DB once verified URL is valide.
    } 
  });
};


// Increment Sequence
var incrementSequence = function(req, res, collectionName, callback) {

  SequenceModel.findOneAndUpdate( {name: collectionName}, {$inc: {id: 1}}, {new: true}, function(err, seq) {
    if (err) {
      console.log("Query DB Error: ", err);
      res.json( {error: 'Internal Server Error.'} );
    }
    else {
      console.log("Connect to DB succeeded.");
      console.log('Seq is: ', seq);
      // Got ouput: Seq is:  { _id: 5b79974599a5f56eaa382de4, name: 'urlPair', id: 5, __v: 0 }
      var sequenceValue = 0;
      if ( seq === null ) {
        console.log('Oops, did not find the collection, be going to create it: ', collectionName);
        var newSequence = new SequenceModel( {name: collectionName, id: sequenceValue} );
        newSequence.save(function(err, seq) {
          if (err) {
            console.log('Create sequence falied for: ', collectionName);
          } else {
            console.log('Create sequence succeeded for: ', collectionName);
          }
        });
      } else if ( seq.name == collectionName ) {
        console.log('Updated as: ', seq);
        sequenceValue = seq.id;
      }
    
    
      var href = url.parse(req.params.original_url).href;
      
      var obj = {id: sequenceValue, href: href};
      callback(req, res, urlPairModel, obj);
    }
  } );
};

// Add a document

var addDoc = function(req, res, model, obj) {
  var doc = new model(obj);
  doc.save(function(err, doc) {
    if (err) {
      console.log("Save to DB failed!");
      res.json( {error: "Internal Server Error."} );
    } else {
      console.log("Save to DB succeeded: ", doc);
      var body = {original_url: doc.href, short_url: doc.id};
      console.log('Be going to respond with body: ', body);
      res.json( body );
    }
  });
}

// Store URL pair to DB
var createURLMapping = function(req, res) {
  
  var originalURL = url.parse(req.params.original_url);
  var href = originalURL.href;
  

  
  urlPairModel.find( {href: href}, function(err, data) {
    if (err) {
      console.log("Error: ", err);
      res.json( {error: 'Internal Server Error.'} );
    } else {
      console.log('Query DB succeeded.');
      if ( data.length > 0 ) {
        
        console.log('Found URL pair aleary in DB: ', data);
        
        var body = {original_url: href, short_url: data[0].id};
        console.log('Response body: ', body);
        res.json( body );
      } else if ( data.length === 0 ) {
        console.log('No URL pair found from DB, be going to create a new one.');
        
        var urlId = incrementSequence(req, res, 'urlPair', addDoc);
        

      }
    }
  });
  
  /*
  var urlPair = new urlPairModel( {id: 123, href: href} );
  
  urlPair.save(function(err, urlPair) {
    if (err) {
      console.log("Save to DB failed!");
      res.json( {error: "Internal Server Error."} );
    }
    else {
      console.log("Save to DB succeeded: ", urlPair);
      var body = {original_url: href, short_url: urlPair.id};
      console.log('Be going to respond with body: ', body);
      res.json( body );
    }
  });
  */
  
};


// Router
app.get("/api/shorturl/new/:original_url(*)", function(req, res) {
  
  console.log("Requested URL: ", req.params.original_url);
  
  var originalURL = url.parse(req.params.original_url);
  console.log("Requested URL: ", originalURL);
  
  var FQDN = originalURL.host;
  
  /*
  var respond = function(result, FQDN) {
    if (result) {
      console.log("Invalid FQDN: ", FQDN);
      res.json( {error: "invalid URL"} );
    } else {
      console.log("Valid FQDN: ", FQDN);
      res.json( {address: ""} )
    }
  };
  */
  
  
  
  validateFQDN(req, res, createURLMapping);
   
  //res.json();
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
