require('dotenv').config();
const express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


/*Database Connection*/
 
let uri = 'mongodb+srv://Florence:' + process.env.PW + '@cluster0.77xx5.mongodb.net/Florence?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* Create URL Model */
let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short: {type: Number}
})

let urlModel = mongoose.model('URL', urlSchema)

/* Getting the URL input parameter */
let bodyParser = require('body-parser')

let responseObject = {}

app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }) ,(request, response)=> {
  let inputUrl = request.body.url
  responseObject['original_url'] = inputUrl
  
    let urlRegex = new RegExp(/(https?:\/\/(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])(:?\d*)\/?([a-z_\/0-9\-#.]*)\??([a-z_\/0-9\-#=&]*)/g);

if(!inputUrl.match(urlRegex)){
  response.json({error: 'invalid url'})
	return
}

  
  let inputShort = 1; // The short url value of the input url
  /* Find the highest short and make input short one higher */
  urlModel
    .findOne({})
    .sort({ short: "desc" })
    .exec((error, result) => {
      if (!error && result != undefined) {
        inputShort = result.short + 1;
      }
      if (!error) {
        urlModel.findOneAndUpdate(
          { original: inputUrl },
          { original: inputUrl, short: inputShort },
          { new: true, upsert: true },
          (error, savedUrl) => {
            if (!error) {
              responseObject["short_url"] = savedUrl.short;
              response.json(responseObject);
            }
          }
        );
      }
    });
  
})

app.get('/api/shorturl/:inputShort', (request, response) => {
  let inputShort = request.params.inputShort
  urlModel.findOne({short: inputShort}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original)
    }else{
      response.json({error: 'URL Does Not Exist'})
    }
  })
})
