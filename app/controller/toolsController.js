const logger = require('js-logger');
const resolvePath = require('object-resolve-path');
var mm = require('micromatch')
var methods = {};

methods.logError = async function(err) {
  try {
    await logger.error(err)
    return await console.error(err)
  } catch (err) {
    logger.error(err)
  }
}

methods.iterateHelpJSON = async function(p) {
  try {
    var oneString = ''
    for (var key in p) {
      oneString += "<b>" + resolvePath(p, key+'.command') + "</b>\n" + resolvePath(p, key+'.description') + "\n\n"
    }
    return await oneString
  } catch (err) {
    logger.error(err)
  }
}

methods.findDetailHelpJSON = async function(p,query) {
  try {
    var oneString = ''
    for (var key in p) {
       if(mm.isMatch(resolvePath(p, key+'.command'), query+'*')){
         oneString += "<b>Command : " + resolvePath(p, key+'.command') + "</b>\n" + resolvePath(p, key+'.detail') + "\n\n"
         return await oneString
       }
    }
    return await 'Command tidak ditemukan'
  } catch (err) {
    logger.error(err)
  }
}

methods.iterateAction = async function(p) {
  try {
    var codes = []
    console.log(p)
    var i = 1
    for (var key in p) {
      
      console.log(i+ ' asd')
      i++
      console.log(key)
      console.log(resolvePath(p, key+'.definition'))
      // console.log('hiii'+key+'  '+ resolvePath(p, key+'.definition'))
      // codes.push({text : key, callback_data : 'openticket '+ resolvePath(p, key+'.definition')+' '+key})
    }
    console.log('a'+codes)
    return await codes
  } catch (err) {
    logger.error(err)
  }
}

methods.iterateJSONSimple = async function(p) {
  try {
    var oneString = '';
    for(i=0;i<Object.keys(p).length;i++){
      oneString += "<b>" +   + "</b> - " + "<em>" + p[key] + "</em>" + "\n"
    }
    return await oneString
  } catch (err) {
    logger.error(err)
  }
}

methods.iterateJSON = async function(p) {
  try {
    var oneString = '';
    for (var key in p) {
      if (p.hasOwnProperty(key)) {
        console.log(key + '   ' + p[key])
        oneString += "<b>" + key + "</b> - " + "<em>" + p[key] + "</em>" + "\n"
      }
    }
    return await oneString
  } catch (err) {
    logger.error(err)
  }
}

module.exports = methods;
