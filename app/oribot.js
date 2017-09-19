//This BOT's script uses 'long-polling' technique

// Set proxy according to BCA's
process.env.http_proxy = "http://kpproxy:8080";

// Centralize all configurations here
const config = require("./definitions/config.json")
const help = require("./definitions/helpcommands.json")
const welcomeCon = require("./controller/welcomeController.js")
const mongoose = require('mongoose');
const MessageModel = require('./models/MessageModel')
const UserModel = require('./models/UserModel')
mongoose.Promise = global.Promise;
const moment = require('moment');
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const options = {
  polling: true
};
const bot = new TelegramBot(config.botkey, options);


mongoose.connect(config.mongoBaseURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  // Connected To the database

  function iterateJSON(p) {
    var oneString = '';
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        oneString += "<b>" + key + "</b> - " + "<em>" + p[key] + "</em>" + "\n"
      }
    }
    return oneString;
  }

  async function asyncTask() {
    try {
      const valueA = await functionA()
      const valueB = await functionB(valueA)
      const valueC = await functionC(valueB)
      return await functionD(valueC)
    } catch (err) {
      logger.error(err)
    }
  }

  async function logError(msg, err) {
    try {
      await logger.error(err)
      await console.error(err)
      return await bot.sendMessage(msg.chat.id, err)
    } catch (err) {
      logger.error(err)
    }
  }

  async function getCurrentUser(msg) {
    try {
      return await UserModel.find({
          chatid: msg.chat.id
        })
        .then(result => {
          if (result.length == 0) {
            return false
          } else {
            return result
          }
        })
        .catch(err => {
          logError(msg, err)
        })
    } catch (err) {
      logError(msg, err)
    }
  }

  async function welcomeMessage(msg) {
    const startMsg = `${__dirname}` + "\\assets\\logo.jpg";
    try {
      await bot.sendPhoto(msg.chat.id, startMsg, {
        caption: "Welcome to BCA ATM Monitoring!"
      })
      if (await getCurrentUser(msg)) {
        await bot.sendMessage(msg.chat.id, 'Berikut adalah command BOT ini : \n' + iterateJSON(help), {
          parse_mode: "HTML"
        })
      } else {
        await bot.sendMessage(msg.chat.id, 'Hai ' + msg.chat.first_name + " " + msg.chat.last_name + "\nSilahkan lakukan pendaftaran dengan mengetik : /register")
      }
    } catch (err) {
      logError(msg, err)
    }
  }

//   async function newRegistration() {
//     try {
//       const valueA = await functionA()
//       const valueB = await functionB(valueA)
//       const valueC = await functionC(valueB)
//       return await functionD(valueC)
//     } catch (err) {
//       logger.error(err)
//     }
//   }
//
//   async userExistsInDB(email, password) {
//     let db = await MongoClient.connect('mongodb://127.0.0.1:27017/notificator');
//     try {
//         let collection = db.collection('users');
//         let userCount = (await collection.find(
//             {
//                 email: email,
//                 password: password
//             }).limit(1).count());
//         return userCount > 0;
//     } finally {
//         db.close();
//     }
// }

  //expr

  bot.onText(/\/asd/, function onAsdText(msg) {
    welcomeMessage(msg);
  });

  //expr

  bot.onText(/\/start/, function onStartText(msg) {
    welcomeMessage(msg);
  });

  bot.onText(/\/register/, function onRegisterText(msg) {

    UserModel.find({
        chatid: msg.from.id
      })
      .then(results => {
        let register = new UserModel({
          chatid: msg.from.id,
          name: msg.from.first_name + " " + msg.from.last_name,
          role: '',
          registerTime: moment(),
          acceptedTime: '',
          blockedTime: '',
          status: 'Registration waiting for approval'
        })

        if (results.length == 0) {
          register.save()
            .then(bot.sendMessage(msg.chat.id, 'Registrasi anda sukses, anda akan menerima notifikasi apabila Admin sudah menyetujui registrasi anda'))
            .catch(err => {
              logError(msg, err)
            })
        } else {
          bot.sendMessage(msg.chat.id, 'Anda sudah pernah mendaftar pada ' + moment(results[0].time).format('LLLL'))
        }
      })
      .catch(err => {
        logError(msg, err)
      })
  });

  bot.onText(/list registrasi/, function onListRegisterText(msg) {
    UserModel.find({
        acceptedTime: ''
      })
      .then(results => {
        if (results.length == 0) {
          bot.sendMessage(msg.chat.id, 'Tidak ada user yang melakukan registrasi')
        } else {
          var i = 1;
          for (let users of results) {
            bot.sendMessage(msg.chat.id, "\
                <b>" + 'Registrasi ' + i + "</b> \n \
                <pre>" + 'ChatID :' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.registerTime + "</pre>", {
              parse_mode: "HTML"
            })
            i++
          }
        }
      })
      .catch(err => {
        logError(msg, err)
      })
  });

  bot.onText(/list user (.+)/, function onListRegisterText(msg, match) {
    var queryString;

    if (match[1] == "all") {
      queryString = '$'
    } else {
      queryString = match[1];
    }

    UserModel.find({
        name: new RegExp(queryString, 'i')
      })
      .then(results => {
        if (results.length == 0) {
          bot.sendMessage(msg.chat.id, 'User list kosong')
        } else {
          var i = 1;
          for (let users of results) {
            bot.sendMessage(msg.chat.id, "\
                <b>" + 'User ' + i + "</b> \
                <pre>" + 'ChatID : ' + users.chatid + "\n" + 'Name   : ' + users.name + "\n" + 'Time   : ' + users.acceptedTime + "</pre>", {
              parse_mode: "HTML"
            })
            i++
          }
        }
      })
      .catch(err => {
        logError(msg, err)
      })
  });

  bot.onText(/approve user (.+)/, function onApproveText(msg, match) {

    UserModel.find({
        chatid: match[1]
      })
      .then(result => {
        if (result.length == 0) {
          bot.sendMessage(msg.chat.id, 'User dengan Chat ID' + match[1] + ' tidak ditemukan dalam list pendaftaran')
        } else {
          if (result[0].acceptedTime != '') {
            bot.sendMessage(msg.chat.id, 'User ' + result.first_name + ' ' + result.last_name + ', Chat ID ' + match[1] + ' sudah terdaftar sebagai pengguna aktif')
          } else {
            UserModel.update({
                chatid: match[1]
              }, {
                acceptedTime: moment().format('LLLL')
              }, {
                upsert: true
              })
              .then(result => {
                UserModel.find({
                    chatid: match[1]
                  })
                  .then(result => {
                    bot.sendMessage(msg.chat.id, 'User ' + result[0].name + ', Chat ID : ' + match[1] + ' sukses diapprove')
                    bot.sendMessage(result[0].chatid, 'Hai ' + result[0].name + '!\nPendaftaran anda sudah disetujui oleh admin !')
                  }).catch(err => {
                    logError(msg, err)
                  })
              }).catch(err => {
                logError(msg, err)
              })
          }
        }
      })
      .catch(err => {
        logError(msg, err)
      })
  });

  bot.onText(/\/photo/, function onPhotoText(msg) {
    // From file path
    // const photo = `${__dirname}/../test/data/photo.gif`;
    const photo = `assets/BCA Logo.png`;
    bot.sendPhoto(msg.chat.id, photo, {
      caption: "I'm a bot!"
    });
  });

  // Matches /audio
  bot.onText(/\/audio/, function onAudioText(msg) {
    // From HTTP request
    const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
    const audio = request(url);
    bot.sendAudio(msg.chat.id, audio);
  });

  // Matches /love
  bot.onText(/\/love/, function onLoveText(msg) {
    const opts = {
      reply_to_message_id: msg.message_id,
      reply_markup: JSON.stringify({
        keyboard: [
          ['Yes, you are the bot of my life ❤'],
          ['No, sorry there is another one...']
        ]
      })
    };
    bot.sendMessage(msg.chat.id, 'Do you love me?', opts);
  });

  // Matches /echo [whatever]
  bot.onText(/\/echo (.+)/, function onEchoText(msg, match) {
    let message = new MessageModel({
      value: msg.text.replace("/save ", ""),
      time: moment()
    })

    message.save()
      .then(bot.sendMessage(msg.chat.id, match[1]))

  });

  // Matches /editable
  bot.onText(/\/editable/, function onEditableText(msg) {
    const opts = {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Edit Text',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'edit'
          }]
        ]
      }
    };
    bot.sendMessage(msg.from.id, 'Original Text', opts);
  });


  // Handle callback queries
  bot.on('callback_query', function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const msg = callbackQuery.message;
    const opts = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
    };
    let text;

    if (action === 'edit') {
      text = 'Edited Text';
    }

    bot.editMessageText(text, opts);
  });

})

const exitProperly = () => {
  mongoose.disconnect()
  process.exit()
}

process.on('SIGINT', exitProperly)
process.on('SIGTERM', exitProperly)
