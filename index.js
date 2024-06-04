require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const { error } = require('console');
const urlModule = require('url');
const app = express();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
});

let urls = mongoose.model('urls', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  console.log(typeof(req.body.url))
  let url = req.body.url;
  dns.lookup( urlModule.parse(url).hostname , async( err , address ) => {
    if(!address) {
      res.json({ error: 'invalid url' });
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        original_url: url,
        short_url: urlCount
      }

      const result = await urls.create(urlDoc)
      console.log(result);
      res.json({ original_url: url, short_url: urlCount })
    }
  });
});

app.get('/api/shorturl/:short_url', async (req,res)=>{
  const shorturl = req.params.short_url;
  const urlDoc = await urls.findOne({short_url: +shorturl})
  if(urlDoc){
    res.redirect(urlDoc.original_url)
  }else{
    res.json({Error: 'No URL found for the given short URL'})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
