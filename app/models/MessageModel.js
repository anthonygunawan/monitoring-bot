'use strict'

const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    value: String,
    time: String
})

const MessageModel = mongoose.model('Message', messageSchema)

module.exports = MessageModel
