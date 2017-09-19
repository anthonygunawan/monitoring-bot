//This BOT's script uses 'long-polling' technique

// Centralize all configurations here
const config = require("./definitions/config.json")
const help = require("./definitions/helpcommands.json")
var connect = require("./controller/connectionController.js")
var common = require("./controller/commonController.js")
var station = require("./controller/stationController.js")
var tools = require("./controller/toolsController.js")
const mongoose = require('mongoose');

var dummy = require("./dummyGenerator.js")

const MessageModel = require('./models/MessageModel')
const UserModel = require('./models/UserModel')
mongoose.Promise = global.Promise;
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = {
  polling: true
};

// Set proxy according to BCA's
process.env.http_proxy = config.proxy;
// Start the BOT
const bot = new TelegramBot(config.botkey, options);
//Initiate connection via mongoose
connect()
//dummy.populateStations(25)
// dummy.populateIncidents()

// bot.sendMessage('222676690', "\
//     <b>" + 'Eskalasi ticket' +"</b> \n \
//     <pre>" + 'Ticket  : TIC0001324'+ "\n" + 'Open date  : 14 September 2017, 20:00:50'+ "\n" + 'Action  : Out of Service - 001'+ "\n" + 'Close date  : -'+ "\n" + 'Comment  : Belum ada action dari pengelola OKT'+ "</pre>", {
//   parse_mode: "HTML"
// })
async function getHelp(msg) {
  try {
    const get = await common.getCurrentUser(msg)
    if (get.status == 'success') {
      await bot.sendMessage(msg.chat.id, 'Berikut adalah command BOT ini : \n' + tools.iterateHelpJSON(help), {
        parse_mode: "HTML"
      })
    } else {
      await bot.sendMessage(msg.chat.id, 'Hai ' + msg.chat.first_name + " " + msg.chat.last_name + "\nSilahkan lakukan pendaftaran dengan mengetik : /register")
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
}

//Bot texts

bot.onText(/\/help/, async function onStartText(msg) {
  getHelp(msg)
});

bot.onText(/\/start/, async function onStartText(msg) {
  try {
    const startMsg = `${__dirname}` + "\\assets\\logo.jpg";
    await bot.sendPhoto(msg.chat.id, startMsg, {
      caption: "Welcome to BCA ATM Monitoring!"
    })
    getHelp(msg)
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/\/register/, async function onRegisterText(msg) {
  try {
    const user = await common.getCurrentUser(msg)
    if (user.status == 'success') {
      const get = await common.register(msg)
      if (get.status == 'success') {
        //Send not
        const getAdmins = await common.getAdmins()
        if (getAdmins.status == 'success') {
          for (let params of getAdmins.param) await bot.sendMessage(params.chatid, 'User ' + msg.chat.first_name + ' ' + msg.chat.last_name + ' melakukan registrasi pada ' + moment().format('LLLL'))
        }
        return await bot.sendMessage(msg.chat.id, 'Registrasi anda sukses, anda akan menerima notifikasi apabila Admin sudah menyetujui registrasi anda')
      } else {
        return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
      }
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/\/registrationlist/, async function onRegistrationListText(msg) {
  try {
    const get = await common.getRegistrationList(msg)
    if (get.status == 'success') {
      var i = 1;
      for (let users of get.param) {
        await bot.sendMessage(msg.chat.id, "\
            <b>" + 'Registrasi ' + i + "</b> \n \
            <pre>" + 'ChatID : ' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.registerTime + "</pre>", {
          parse_mode: "HTML"
        })
        i++
      }
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/search user (.+)/, async function onSearchUserText(msg, match) {
  try {
    var query
    if (match[1] == "all")
      query = '$'
    else
      query = match[1]

    const get = await common.searchUser(msg, query)
    if (get.status == 'success') {
      var i = 1;
      for (let users of get.param) {
        bot.sendMessage(msg.chat.id, "\
            <b>" + 'User ' + i + "</b> \
            <pre>" + 'ChatID : ' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.acceptedTime + "</pre>", {
          parse_mode: "HTML"
        })
        i++
      }
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/approve user (.+)/, async function onApproveUserText(msg, match) {
  try {
    var query = match[1]
    const get = await common.approveUser(msg, query)
    if (get.status == 'success') {
      await bot.sendMessage(msg.chat.id, 'User ' + get.param.name + ', Chat ID : ' + get.param.chatid + ' sukses diapprove')
      return await bot.sendMessage(get.param.chatid, 'Hai ' + get.param.name + '!\nPendaftaran anda sudah disetujui oleh admin !')
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/grant admin (.+)/, async function onGrantAdminText(msg, match) {
  try {
    const get = await common.addAdmin(msg)
    if (get.status == 'success') {
      await bot.sendMessage(msg.chat.id, 'User ' + get.param.name + ', Chat ID : ' + get.param.chatid + ' sukses menjadi Super Admin')
      return await bot.sendMessage(get.param.chatid, 'Hai ' + get.param.name + '!\nRole anda sekarang adalah Super Admin !')
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

//station functions

bot.onText(/my stations (.+)/, async function onMyStationsText(msg, match) {
  try {
    var query = match[1]
    const get = await station.getMyStations(msg, query)
    if (get.status == 'success') {

      var i = 1;
      for (let stations of get.param) {
        // await bot.sendMessage(msg.chat.id, "\
        //     <b>" + 'Station ' + i + "</b> \n \
        //     <pre>" + 'Name     : ' + stations.name + "\n" + 'Type     : ' + stations.type + "\n" + 'Address  : ' + stations.address + "\n" + 'Status   : ' + stations.status + "\n" + 'Balance  : Rp ' + stations.balance + "\n" + 'Hopper 1 : Rp ' + stations.hoppers.hopper1 + "\n" + 'Hopper 2 : Rp ' + stations.hoppers.hopper2 + "\n" + 'Hopper 3 : Rp ' + stations.hoppers.hopper3 + "\n" + 'Hopper 4 : Rp ' + stations.hoppers.hopper4 + "</pre>", {
        //   parse_mode: "HTML"
        // })

        await bot.sendMessage(msg.chat.id, "\
            <b>" + 'Station ' + i + "</b> \n \
            <pre>" + 'Name     : ' + stations.name + "\n" + 'Type     : ' + stations.type + "\n" + 'Address  : ' + stations.address + "\n" + 'Status   : ' + stations.status + "\n" + 'Hopper 1 : ' + stations.hoppers.hopper1 + "\n" + 'Hopper 2 : ' + stations.hoppers.hopper2 + "\n" + 'Hopper 3 : ' + stations.hoppers.hopper3 + "\n" + 'Hopper 4 : ' + stations.hoppers.hopper4 + "</pre>", {
          parse_mode: "HTML"
        })
        i++
      }
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/my incidents/, async function onMyIncidentsText(msg) {
  try {
    await bot.sendMessage(msg.chat.id, "\
        <b>" + 'Incident 1' + "</b> \n \
        <pre>" + 'Ticket  : TIC0001234' + "\n" + 'Open date  : 14 September 2017, 15:00:50' + "\n" + 'Action  : Out of Service - 001' + "\n" + 'Close date  : -' + "\n" + 'Comment  : Ticket Generated by System' + "</pre>", {
      parse_mode: "HTML"
    })
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

bot.onText(/create ticket (.+)/, async function onCreateTicketText(msg) {
  try {
    const get = await common.register(msg)
    if (get.status == 'success') {
      const getAdmins = await common.getAdmins()
      if (getAdmins.status == 'success') {
        for (let params of getAdmins.param) await bot.sendMessage(params.chatid, 'User ' + msg.chat.first_name + ' ' + msg.chat.last_name + ' melakukan registrasi pada ' + moment().format('LLLL'))
      }
      return await bot.sendMessage(msg.chat.id, 'Registrasi anda sukses, anda akan menerima notifikasi apabila Admin sudah menyetujui registrasi anda')
    } else {
      return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + get.param)
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
});

const exitProperly = () => {
  mongoose.disconnect()
  process.exit()
}

process.on('SIGINT', exitProperly)
process.on('SIGTERM', exitProperly)
