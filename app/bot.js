//This BOT's script uses 'long-polling' technique

// Centralize all configurations here
const config = require("./definitions/config.json")
const help = require("./definitions/helpcommands.json")
const actions = require("./definitions/actioncodes.json")
var connect = require("./controller/connectionController.js")
var common = require("./controller/commonController.js")
var station = require("./controller/stationController.js")
var tools = require("./controller/toolsController.js")
var mm = require('micromatch')
const resolvePath = require('object-resolve-path');
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

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async function onMessage(msg) {
  try {
    //Query user's data for every message received
    const user = await common.getCurrentUser(msg)

    if (user.status == 'success') {
      //Registered user zone

      switch (true) {


        case mm.isMatch(msg.text, '/start'):
          const startMsg = `${__dirname}` + "\\assets\\logo.jpg";
          return await bot.sendPhoto(msg.chat.id, startMsg, {
            caption: "Welcome to BCA ATM Monitoring!"
          })
          break


        case mm.isMatch(msg.text, '/help'):
          return await bot.sendMessage(msg.chat.id, 'Berikut adalah command BOT ini : \n' + await tools.iterateHelpJSON(help) + '\nUntuk detail lebih lanjut, ketik /help [command]', {
            parse_mode: "HTML"
          })
          break

        case mm.isMatch(msg.text, '/help *'):
            return await bot.sendMessage(msg.chat.id, await tools.findDetailHelpJSON(help, mm.capture('/help *', msg.text)) + '\n', {
              parse_mode: "HTML"
            })
        break


        case mm.isMatch(msg.text, '/register'):
          return await bot.sendMessage(msg.chat.id, 'Anda sudah menjadi pengguna aktif')
          break


        case mm.isMatch(msg.text, ['registration list*', 'list regist*']):
          const getList = await common.getRegistrationList(msg)
          if (getList.status == 'success') {
            var i = 1;
            for (let users of getList.param) {
              await bot.sendMessage(msg.chat.id, "\
                <b>" + 'Registrasi ' + i + "</b> \n \
                <pre>" + 'ChatID : ' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.registerTime + "</pre>", {
                parse_mode: "HTML"
              })
              i++
            }
          }
          return await bot.sendMessage(msg.chat.id, i - 1 + ' pengguna menunggu konfirmasi registrasi.')
          break


        case mm.isMatch(msg.text, '/search user *'):
          var search = mm.capture('/search user *', msg.text)
          if (search == '' || search == undefined) return await bot.sendMessage(msg.chat.id, 'Format pencarian salah.. ')
          else {

            if (mm.isMatch(search.toString(), ['name*', 'nama*', 'role*', 'id*', 'chatid*'])) {
              const doSearch = await common.searchUser(msg, search.toString())
              if (doSearch.status == 'success') {
                var i = 1
                for (let users of doSearch.param) {
                  await bot.sendMessage(msg.chat.id, "\
                      <b>" + 'User ' + i + "</b> \
                      <pre>" + 'ChatID : ' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.acceptedTime + "</pre>", {
                    parse_mode: "HTML"
                  })
                  i++
                }
              }
            } else return await bot.sendMessage(msg.chat.id, 'Format pencarian salah.. ')

          }
          return await bot.sendMessage(msg.chat.id, 'Anda telah melakukan pencarian : ' + search)
          break

        case mm.isMatch(msg.text, '/approve user *'):
          var id = mm.capture('/approve user *', msg.text)
          if (id == '' || id == undefined) return await bot.sendMessage(msg.chat.id, 'Format approval salah..\n/approve user [ChatID]')
          else {
            const approve = await common.approveUser(msg, id)
            if (approve.status == 'success') {
              await bot.sendMessage(msg.chat.id, 'User ' + approve.param.name + ', Chat ID : ' + approve.param.chatid + ' sukses diapprove')
              return await bot.sendMessage(approve.param.chatid, 'Hai ' + approve.param.name + '!\nPendaftaran anda sudah disetujui oleh admin !')
            }
          }
          break

        case mm.isMatch(msg.text, '/grant admin *'):
          var id = mm.capture('/grant admin *', msg.text)
          if (id == '' || id == undefined) return await bot.sendMessage(msg.chat.id, 'Format grant admin salah..\n/grant admin [ChatID]')
          else {
            const grantAdmin = await common.addAdmin(msg)
            if (grantAdmin.status == 'success') {
              await bot.sendMessage(msg.chat.id, 'User ' + grantAdmin.param.name + ', Chat ID : ' + grantAdmin.param.chatid + ' sukses menjadi Super Admin')
              return await bot.sendMessage(grantAdmin.param.chatid, 'Hai ' + grantAdmin.param.name + '!\nRole anda sekarang adalah Super Admin !')
            }
          }
          break

        case mm.isMatch(msg.text, '/my stations*'):
          var search = mm.capture('/my stations *', msg.text)
          if (search == '' || search == undefined || !mm.isMatch(search.toString(), ['all', 'semua', 'name*', 'type*', 'address*', 'status*']))
            return await bot.sendMessage(msg.chat.id, 'Format pencarian salah..\n /my stations [name | type | address | status] [query] ')
          else {
            const doSearch = await station.getMyStations(msg, search.toString(), user)
            if (doSearch.status == 'success') {
              var i = 1;
              for (let stations of doSearch.param) {
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
            }
          }
          return await bot.sendMessage(msg.chat.id, 'Anda telah melakukan pencarian : ' + search)
          break

          case mm.isMatch(msg.text, '/open ticket *'):
            var id = mm.capture('/open ticket *', msg.text)
            if (id == '' || id == undefined) return await bot.sendMessage(msg.chat.id, 'Format open ticket salah..\n/open ticket [WSID]')
            else {
              console.log('masok')
              var codes = []
              codes = await tools.iterateAction(actions)
              console.log('asd'+codes)
              if (codes){
                const opts = {
                  reply_markup: {
                    inline_keyboard: [codes]
                  }
                }
                await bot.sendMessage(msg.chat.id, 'List action code : \n' + await tools.iterateJSONSimple(actions) + '\n', {
                  parse_mode: "HTML"
                })

                return await bot.sendMessage(msg.from.id, 'Original Text', opts);
              }
          }
            break


        default:
          break
      }

    } else if (user.param == 'User not found') {
      //Unregistered user zone

      if (mm.isMatch(msg.text, '/register*')) {
        const doRegister = await common.register(msg)
        if (doRegister.status == 'success') {
          //Send notification to all admins of this new incoming registration request
          const getAdmins = await common.getAdmins()
          if (getAdmins.status == 'success') {
            for (let params of getAdmins.param) await bot.sendMessage(params.chatid, 'User ' + msg.chat.first_name + ' ' + msg.chat.last_name + ' melakukan registrasi pada ' + moment().format('LLLL'))
          }
          return await bot.sendMessage(msg.chat.id, 'Registrasi anda sukses, anda akan menerima notifikasi apabila Admin sudah menyetujui registrasi anda')
        }
      }

    } else {
      return await bot.sendMessage(msg.chat.id, 'Hai ' + msg.chat.first_name + " " + msg.chat.last_name + "\nSilahkan lakukan pendaftaran dengan mengetik : /register")
    }
  } catch (err) {
    tools.logError(err)
    return await bot.sendMessage(msg.chat.id, 'We got an error !\n' + err)
  }
})



const exitProperly = () => {
  mongoose.disconnect()
  process.exit()
}

process.on('SIGINT', exitProperly)
process.on('SIGTERM', exitProperly)
