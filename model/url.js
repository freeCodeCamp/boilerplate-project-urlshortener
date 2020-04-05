const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  original: String,
  short: String
})

const Url = mongoose.model('Url', urlSchema)

module.exports = Url;