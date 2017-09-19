'use strict'

const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
  groupid: String,
  name: String,
  member: {
    chatid: String,
    level: String
  }
}, {
  collection: 'groups'
})
const GroupModel = mongoose.model('Group', groupSchema, 'groups')

module.exports = GroupModel
