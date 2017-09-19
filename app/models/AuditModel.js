'use strict'

const mongoose = require('mongoose')

const auditSchema = mongoose.Schema({
    action: String,
    chatid: String,
    time: String
},{collection: 'audittrail'})
const AuditModel = mongoose.model('Audit', auditSchema,'audittrail')

module.exports = AuditModel
