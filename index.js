const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const shortid = require('shortid')
const dotenv = require('dotenv').config()
var app = express()

// Basic Configuration
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', async function(req, res){
  const {url} = req.body
  const uid = shortid.generate()
  console.log(validURL.isUri(url));
  if (validURL.isWebUri(url) === undefined) {
    res.json({
      error: 'invalid url',
    });
  } else{
    console.log(url)
    client.connect( async err =>{
       if (err) throw err
       await client.db('url-db').collection('url-config').insertOne({
         "url": `${url}`,
         "short_id": `${uid}`,
       })
       res.send({
         "url": `${url}`,
         "short_id": `${uid}`,
       })
      })
  }
   
})
app.get("/api/shorturl/:shorturl", async function(req, res){
  client.connect(async err =>{
      if(err) throw err
      await client.db("url-db").collection("url-config").find({}).toArray(async function(err, result){
          if(err) throw err;
          result.forEach((obj) =>{
              if(obj.short_id == req.params.shorturl){
                  res.redirect(obj.url)
              } else{
                  console.log("PASSED")
              }
          })
      })
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
