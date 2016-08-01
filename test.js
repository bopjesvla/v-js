var v = require('.')
var Schema = require('./schema')
var fs = require('fs')
// var sql = fs.readFileSync('./dump.sql', 'utf8')
var pg = require('pg')
var client = {user: 'postgres', password: '12zxcv', database: 'SLAPTCHA'}

// console.log(validate('users', {email: 'a@b', password: '1'.repeat(64)}, {ignoreDefaults: 0}))
eval(v('create table cool(a text check (a = "c"))').replace(/v-js/g, '.'))
console.log(module.exports.validate('cool', {a: 2}))

var mod = v({client, tables: {
  users: ['email']
}}, (err, res) => {
  console.log(res)
  eval(res.replace(/v-js/g, '.'))
  var schema = module.exports
  schema.functions( require('./fn'))
  console.log(schema.validate('users', {email: 'a@b', password: '1234567891234567891234567890001234567890'}, {ignoreDefaults: true}))
})
