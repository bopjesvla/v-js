var v = require('.')
var Schema = require('./schema')
var fs = require('fs')
// var sql = fs.readFileSync('./dump.sql', 'utf8')
var pg = require('pg')
var client = new pg.Client({user: 'postgres', password: '12zxcv', database: 'SLAPTCHA'})

client.connect(err => {
  if (err) {
    throw err
  }
  
  var mod = v.fromPG(client, {tables: {
    users: ['email','password']
  }}, res => {
    var schema = new Schema(res, {fn: require('./fn')})
    console.log(schema.validate('users', {email: 'a@b', password: '1234567891234567891234567890001234567890'}, {ignoreDefaults: true}))
    client.end()
  })
  // console.log(validate('users', {email: 'a@b', password: '1'.repeat(64)}, {ignoreDefaults: 0}))
})
