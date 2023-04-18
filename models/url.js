const mongoose = require('mongoose');
const dns = require('node:dns')

const urlSchema = new mongoose.Schema({
  url : {
    type: String,
    required: true,
    validate : {
      validator : urlValidator,
      message : "invalid url"
    },
    unique: true
  },
  short_url : {
    type : Number
  }
});

function urlValidator(v){
  const urlPattern = /^(https?:\/\/)(.*)$/ 
  return new Promise((resolve,reject)=>{
    if(!v.match(urlPattern)){
      resolve(false);
    }
    dns.lookup(v.match(urlPattern)[2],(err)=>{
      if(err || !v.match()){
        resolve(false);
      }
      resolve(true);
    })
  })
}


module.exports = mongoose.model('Url', urlSchema);