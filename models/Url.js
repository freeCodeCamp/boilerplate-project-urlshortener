const mongoose = require('mongoose');

const {Schema} = mongoose;

let UrlSchema = new Schema({
    original_url:{
        type:String,
        length:256,
        required:true,
        unique:true
    },
    short_url:{
        type:String,
        length:256,
        required:true,
        unique:true
    }
});

module.exports = mongoose.model('Url',UrlSchema);