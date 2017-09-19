const UserModel = require('../models/UserModel')
const moment = require('moment');
var mm = require('micromatch')
var tools = require("../controller/toolsController.js")

var methods = {};

methods.getCurrentUser = async function(msg) {
  try {
    const user = await UserModel.find({
      chatid: msg.chat.id
    })
    if (user.length != 0) return await {
      status: 'success',
      param: user
    }
    else return await {
      status: 'failed',
      param: 'User not found'
    }

  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.getAdmins = async function() {
  try {
    const user = await UserModel.find({
      role: 'Super Admin'
    })

    if (user.length != 0) return await {
      status: 'success',
      param: user
    }
    else return await {
      status: 'failed',
      param: 'Admin list empty'
    }

  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.register = async function(msg) {
  try {
    var fullname = ''
    if(msg.from.last_name==undefined) fullname = msg.from.first_name
    else fullname = msg.from.first_name + " " + msg.from.last_name
    let register = new UserModel({
      chatid: msg.from.id,
      name: fullname,
      role: '',
      registerTime: moment(),
      acceptedTime: '',
      blockedTime: '',
      status: 'Registration waiting for approval'
    })

      await register.save()
      return await {
        status: 'success',
        param: register
      }

  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.getRegistrationList = async function(msg) {
  try {
    const users = await UserModel.find({
      acceptedTime: ''
    })
    if (users.length != 0) return await {
      status: 'success',
      param: users
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

methods.searchUser = async function(msg, query) {
  try {

    var queryString = query.split(" ")
    var queryField = queryString[0]
    var queryValue = ''
    var queryJSON = {}
    var operator = {}

    for(i=1;i<=queryString.length-1;i++){
      if(i!=1) queryValue += ' '
      queryValue += queryString[i]
    }

    if (queryValue == '' || queryValue == undefined) queryValue = '$'
    if (mm.isMatch(queryField, ['all', 'semua'])) queryField = 'name'
    operator['$regex'] = queryValue
    operator['$options'] = 'i'
    queryJSON[queryField] = operator
    console.log(queryJSON)

    const users = await UserModel.find(queryJSON)

    if (users.length != 0) return await {
      status: 'success',
      param: users
    }
    else return await {
      status: 'failed',
      param: 'No result'
    }

  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.approveUser = async function(msg, query) {
  try {
    const user = await UserModel.findOne({
      chatid: query
    })

    if (user.length != 0) {
      if (user.acceptedTime != '') {
        return await {
          status: 'failed',
          param: 'User ' + query + ' is already active!'
        }
      } else {
        await UserModel.update({
          chatid: query
        }, {
          acceptedTime: moment().format('LLLL')
        }, {
          upsert: true
        })
        return await {
          status: 'success',
          param: user
        }
      }
    } else return await {
      status: 'failed',
      param: 'user ' + query + ' not found on registration list!'
    }
  } catch (err) {
    tools.logError(msg, err)
    return await {
      status: 'failed',
      param: err
    }
  }
}

methods.addAdmin = async function(msg) {
  try {
    const user = await UserModel.findOne({
      chatid: msg.chat.id
    })

    if (user.length != 0) {
      await UserModel.update({
        chatid: msg.chat.id
      }, {
        role: 'Super Admin'
      }, {
        upsert: true
      })
      return await {
        status: 'success',
        param: user
      }
    } else return await {
      status: 'failed',
      param: 'user ' + msg.chat.id + ' not found on user list!'
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
