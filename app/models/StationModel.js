'use strict'

const mongoose = require('mongoose')

const stationSchema = mongoose.Schema({
    name: String,
    type: String,
    address: String,
    status: String,
    balance: String,
    hoppers: {hopper1: String, hopper2: String, hopper3: String, hopper4: String},
    pengelola: {chatid: String}
},{collection: 'stations'})
const StationModel = mongoose.model('Station', stationSchema,'stations')

module.exports = StationModel
