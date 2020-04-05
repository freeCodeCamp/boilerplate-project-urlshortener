const mongoose = require('mongoose');
const db = mongoose.connection;

const connectToMongoose = function () {
  mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true 
  });
  db.on('error', console.error.bind(console, 'connection error:'));
}
module.exports = { connectToMongoose }