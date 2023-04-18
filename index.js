require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bodyparser = require('body-parser');

const Url = require('./models/url');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('db connected!');
});

app.use(bodyparser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res, next) => {
  try {
    const inputUrl = req.body.url;
    const url = await new Url({ url: inputUrl }).saveUrl();
    res.json({
      original_url: url.url,
      short_url: url.short_url,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.json({
      // getting first error message
      error: err.errors[Object.keys(err.errors)[0]].message,
    });
  }
  next(err);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
