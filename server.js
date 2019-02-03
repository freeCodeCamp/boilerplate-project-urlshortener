'use strict';

const mongo = require('mongodb');
const mongoose = require('mongoose');
const express = require('express');
const server = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');


/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

server.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

server.use('/public', express.static(process.cwd() + '/public'));

server.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
server.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


server.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}...`);
});
