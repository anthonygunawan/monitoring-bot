'use strict'

const mongoose = require('mongoose')

const incidentSchema = mongoose.Schema({
  ticket: String,
  open: String,
  close: String,
  comment:{chatid: String, time: String, comment: String},
  action:{code: String, definition: String}
},{collection: 'incidents'})
const IncidentModel = mongoose.model('Incident', incidentSchema,'incidents')

module.exports = IncidentModel
