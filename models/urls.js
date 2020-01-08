var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose'); 
var schema = mongoose.Schema;

const schemaOptions = {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

const urlSchema = new schema({
  original_url:{
    type: String,
    required: true
  },
  short_url:{
    type: String, 
    required: true
  },

}, schemaOptions );

var Urls = mongoose.model('Url', urlSchema, 'urls');
module.exports = Urls;