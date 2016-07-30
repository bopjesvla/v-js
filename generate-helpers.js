var v = require('.'), fs = require('fs')

fs.writeFileSync('./helpers.js', 'module.exports = ' + v.helpers())
