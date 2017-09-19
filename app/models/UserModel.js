'use strict'

const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    chatid: String,
    name: String,
    role: String,
    registerTime: String,
    acceptedTime: String,
    blockedTime: String,
    status: String,
    group: {groupid:String}
},{collection: 'users'})
const UserModel = mongoose.model('User', userSchema,'users')

module.exports = UserModel
