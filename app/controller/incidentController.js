const StationModel = require('../models/StationModel')
const moment = require('moment');
var tools = require("../controller/toolsController.js")
var common = require("./controller/commonController.js")
var station = require("./controller/stationController.js")

var methods = {};

// const incidentSchema = mongoose.Schema({
//   ticket: String,
//   open: String,
//   close: String,
//   comment:{chatid: String, time: String, comment: String},
//   action:{code: String, definition: String}
// },{collection: 'incidents'})

methods.createTicket = async function(msg, query) {
  try {
      var queryString = query.split(" ")
      var stationName = queryString[0]
      var ticketDetails = ''
      var queryJSON = {}
      var operator = {}

      for(i=1;i<=queryString.length-1;i++){
        if(i!=1) ticketDetails += ' '
        ticketDetails += queryString[i]
      }

      if (stationName == '' || stationName == undefined) return await {
        status: 'failed',
        param: 'Station name is empty'
      }

      if (queryValue == '' || queryValue == undefined)  return await {
        status: 'failed',
        param: 'Ticket detail is required'
      }




      queryValue = '$'
      if (queryCommand == "all" || queryCommand == "*" || queryCommand == "") queryCommand = 'name'
      operator['$regex'] = queryValue
      operator['$options'] = 'i'
      queryJSON[queryCommand] = operator

      for (let user of getUser.param) {
        if (user.role != 'Super Admin'){
          queryJSON['pengelola.chatid'] = msg.chat.id
        }
      }

      console.log(queryJSON)

      const stations = await StationModel.find(queryJSON)

      if (stations.length != 0) return await {
        status: 'success',
        param: stations
      }
      else return await {
        status: 'failed',
        param: 'Empty list'
      }
  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

module.exports = methods;
