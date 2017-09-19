const IncidentModel = require('../models/IncidentModel')
const StationModel = require('../models/StationModel')
const moment = require('moment')
var tools = require("../controller/toolsController.js")
var common = require("../controller/commonController.js")

var methods = {}

methods.getMyStations = async function(msg, query, user) {
  try {
    //Only super admin can query the whole system
      var queryString = query.split(" ")
      var queryCommand = queryString[0]
      var queryValue = ''
      var queryJSON = {}
      var operator = {}

      for(i=1;i<=queryString.length-1;i++){
        if(i!=1) queryValue += ' '
        queryValue += queryString[i]
      }

      if (queryValue == '' || queryValue == undefined) queryValue = '$'
      if (queryCommand == "all" || queryCommand == "*" || queryCommand == "") queryCommand = 'name'
      operator['$regex'] = queryValue
      operator['$options'] = 'i'
      queryJSON[queryCommand] = operator

      for (let usr of user.param) {
        if (usr.role != 'Super Admin'){
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
