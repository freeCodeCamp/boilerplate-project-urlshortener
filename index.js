require('dotenv').config();
const express = require("express");
const Router = express.Router();
const mongoose = require('mongoose');
const UrlModel = require('./models/Url');
const http = require('http')

let alphaNumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function getRandomUrl(longUrl=""){
    let iteration = longUrl.length%alphaNumeric.length;
    let shortUrl="";

    for(let i=0;i<iteration;i++){

        shortUrl+=alphaNumeric.charAt(Math.floor(Math.random()*62+0));

    }

    return (shortUrl);
    
    
}

function validateUrl(req,res,next){
    let regex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

    if(!regex.test(req.body.original_url)){
        return res.json({ error: 'invalid url' });
    }else{
        next();
    }
}
Router.post('/api/shorturl/',validateUrl,function(req,res){
    let {original_url} = req.body;
    let objectSave = {
        original_url,
        short_url:getRandomUrl(original_url)
    }
    UrlModel.create(objectSave,function(error,data){
        if(error) throw error;
        let responseObjet = {
            original_url:data.original_url,
            short_url:data.short_url
        }
        return res.json(responseObjet);
    })
   
})
Router.get('/api/shorturl/:short_url',function(req,res){
    
    let {short_url} = req.params;
    UrlModel.findOne({short_url})
    .exec(function(error,data){
        console.log(data);
        if(error) throw error;
        let {original_url}=data; 
        console.log(original_url)
        // return res.redirect(301,`${data.original_url}`);
        return res.send('good');
    })
    
    
})


mongoose.disconnect();
module.exports = Router;