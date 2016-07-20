var v = require('.')

var mod = v('create table q (a text, constraint test check (a REGEXP "5"), constraint test2 check (a REGEXP "6"));')
eval(mod)
var validate = module.exports

console.log(validate('q', {a: '4'}))
