const mongoose = require('mongoose');
const StationModel = require('./models/StationModel')
const actions = require('./definitions/actioncodes')
var station = require("./controller/stationController.js")
var tools = require("./controller/toolsController.js")
// const IncidentModel = require('./models/IncidentModel')

var methods = {};

methods.generateID = async function() {
  var text = ""
  var head = "986Z"
  var tail = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  text += head.charAt(Math.floor(Math.random() * head.length))

  for (var i = 0; i < 3; i++)
    text += tail.charAt(Math.floor(Math.random() * tail.length))

  return text
}

methods.generateAddress = async function() {
  var addressList = ['Jakarta', 'Bogor', 'Demak', 'Tangerang', 'Bekasi']
  return addressList[Math.floor(Math.random() * addressList.length)]
}

methods.generateStatus = async function() {
  return actions[Math.floor(Math.random() * Object.keys(actions).length)]
}

methods.generateBalance = async function() {
  var balance = ''
  var possible = "123456789";
  var possible2 = "05";

  for (var i = 0; i < 3; i++)
    balance += possible.charAt(Math.floor(Math.random() * possible.length));

  balance += possible2.charAt(Math.floor(Math.random() * possible2.length));

  for (var i = 0; i < 4; i++)
    balance += 0

  return balance;
}

methods.generateBalanceStatus = async function() {
  // var balanceStatus = ['Full','Near full', 'Near Empty', 'Empty']
  var balanceStatus = ['Full','Near full']
  return balanceStatus[Math.floor(Math.random() * balanceStatus.length)]
}



methods.generatePengelola = async function() {
  var pengelolaList = ['222676690', '262769634', '222676691', '222676692', '222676694', '222676695']
  // var pengelolaList = ['222676690', '262769634']
  return pengelolaList[Math.floor(Math.random() * pengelolaList.length)]
}

methods.populateStations = async function(p) {
  var name, type, address, status, balance, hopper1, hopper2, hopper3, hopper4, pengelola

  for (i = 0; i < p; i++) {
    name = await methods.generateID()

    switch (name.charAt(0)) {
      case '9':
        type = 'KIOSK'
        break;
      case '8':
        type = 'ATM'
        break;
      case '6':
        type = 'CDM'
        break;
      case 'Z':
        type = 'CRM'
        break;
    }

    address = await methods.generateAddress()
    status = await methods.generateStatus()

    switch (status) {
      case 'Cash Low on Hopper 1':
        hopper1 = 'Near Empty'
        hopper2 = await methods.generateBalanceStatus()
        hopper3 = await methods.generateBalanceStatus()
        hopper4 = await methods.generateBalanceStatus()
        break;
      case 'Cash Low on Hopper 2':
        hopper2 = 'Near Empty'
        hopper1 = await methods.generateBalanceStatus()
        hopper3 = await methods.generateBalanceStatus()
        hopper4 = await methods.generateBalanceStatus()
        break;
      case 'Cash Low on Hopper 3':
        hopper3 = 'Near Empty'
        hopper2 = await methods.generateBalanceStatus()
        hopper1 = await methods.generateBalanceStatus()
        hopper4 = await methods.generateBalanceStatus()
        break;
      case 'Cash Low on Hopper 4':
        hopper4 = 'Near Empty'
        hopper2 = await methods.generateBalanceStatus()
        hopper3 = await methods.generateBalanceStatus()
        hopper1 = await methods.generateBalanceStatus()
        break;
      default:
        hopper1 = await methods.generateBalanceStatus()
        hopper2 = await methods.generateBalanceStatus()
        hopper3 = await methods.generateBalanceStatus()
        hopper4 = await methods.generateBalanceStatus()
        break;
    }

    //balance = parseInt(hopper1) + parseInt(hopper2) + parseInt(hopper3) + parseInt(hopper4)
    pengelola = await methods.generatePengelola()

    await StationModel.create({
      name: name,
      type: type,
      address: address,
      status: status,
      //balance: balance,
      hoppers: {
        hopper1: hopper1,
        hopper2: hopper2,
        hopper3: hopper3,
        hopper4: hopper4
      },
      pengelola: {
        chatid: pengelola
      }
    });
  }
}

methods.generateTicketID = async function() {
  var text = "INC"
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length))

  return text
}



methods.populateIncidents = async function() {
  var name, type, address, status, balance, hopper1, hopper2, hopper3, hopper4, pengelola

  try {
    //Randomize all stations
    var dummyStations = {}
    var insides = {};
    var msg = {
      chat: {
        id: '262769634'
      }
    }
    const get = await station.getMyStations(msg, 'all')

    if (get.status == 'success') {
      for (let stations of get.param) {
        dummyStations += stations.name
      }
    } else return await {
      status: 'failed',
      param: 'Failed at populating stations'
    }
    console.log(dummyStations)
    //   for (let stations of dummyStations){
    //     console.log(stations)
    //     await IncidentModel.create({
    //       ticket: await generateTicketID(),
    //       open: moment.format('LLLL'),
    //       close: '',
    //       comment:{
    //         chatid: '222676690',
    //         time: moment.format('LLLL'),
    //         comment: 'Ticket issued by system'
    //       },
    //       action:{
    //         code: '1',
    //         definition: 'Out of Service'
    //       }
    //   })
    // }
  } catch (err) {
    tools.logError(err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.dropDB = async function() {
  return await StationModel.drop({})
}

module.exports = methods;
