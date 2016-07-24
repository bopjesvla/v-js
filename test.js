var v = require('.')
var fs = require('fs')
var sql = fs.readFileSync('./dump.sql', 'utf8')

var mod = v(sql, {fn: {char_length: x => x.length, nextval: x => 1}, embedValidator: true})
eval(mod)
var validate = module.exports

console.log(validate('users', {email: 'a@b', password: '1'.repeat(64)}, {ignoreDefaults: 0}))
