const config = require("../definitions/config.json")
var tools = require("../controller/toolsController.js")
const mongoose = require('mongoose');

var connect = async function () {
  try {
    await mongoose.connect(config.mongoBaseURL, {
      useMongoClient: true
    });

    mongoose.connection.on('connected', function() {
      console.log('Mongoose default connection open to ' + dbURI);
    });

    mongoose.connection.on('open', function() {
      console.log('Mongoose default connection open to ' + dbURI);
    });

    // If the connection throws an error
    mongoose.connection.on('error', function(err) {
      console.log('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function() {
      console.log('Mongoose default connection disconnected');
    });

  } catch (err) {
    tools.logError(err)
  }
}

module.exports = connect;
