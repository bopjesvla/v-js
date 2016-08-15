var v = require('.')
var Schema = require('./schema')
var fs = require('fs')
// var sql = fs.readFileSync('./dump.sql', 'utf8')
var pg = require('pg')
var client = {user: 'postgres', password: '12zxcv', database: 'SLAPTCHA'}

// console.log(validate('users', {email: 'a@b', password: '1'.repeat(64)}, {ignoreDefaults: 0}))
eval(v('create table cool(a text check (a = "c"))').replace(/v-js/g, '.'))
console.log(module.exports.validate('cool', {a: 2}))

v('create table w (a text check (a = any(array[5])))')

var mod = v({client, sql: 'create table cool(a text not null)', tables: {
  users: ['email', 'password']
}}, (err, res) => {
  eval(res.replace(/v-js/g, '.'))
  var schema = module.exports
  console.log(schema.validate('users', {email: 'a@a', password: null}, {ignoreEmpty: true, ignoreUnknown: true}))
  console.log(schema.validate('cool', {}))
})
