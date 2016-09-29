var assert = require('assert')
var schema = require('./test.v.js')

var success = {success: true}

assert.deepEqual(schema('simple').e('virtue_error', 'is_generous'), {error: 'virtue_error', violated: ['is_generous'], table: 'simple'})

assert.deepEqual(schema('simple').validate({a: 'c'}), success)
assert.deepEqual(schema('simple').validate({a: 'b'}), schema('simple').e('constraint_violated', {name: 'is_c', columns: ['a']}))

var simple = schema('simple')

assert.deepEqual(simple.validate({}), success)
assert.deepEqual(simple.validate({a: void 0}), success)
assert(simple.validate({}, {partial: true}).success)
assert.deepEqual(simple.validate({a: 'c', b: 'd'}), simple.e('unknown_field', 'b'))
assert.deepEqual(simple.defaults(), {a: void 0})

simple.assert({})

assert.throws(_ => simple.assert({a: 'b'}), /constraint_violated: is_c by a/)

var attrs = schema('attributes'), users = schema('users')

assert(attrs.validate({is_nullable: 'YES', numeric_precision: 5}), success)
assert.deepEqual(attrs.validate({is_nullable: 'YES', numeric_precision: -5}), attrs.e('constraint_violated', {columns: ['numeric_precision'], name: 'cardinal_number_domain_check'}))
assert.deepEqual(attrs.validate({is_nullable: 'YEAH', numeric_precision: 5}), attrs.e('constraint_violated', {columns: ['is_nullable'], name: 'yes_or_no_check'}))

assert.deepEqual(users.validate({email: 'a@a.nl', password: 'a', virtue: 5}), success)
assert.deepEqual(users.validate({email: 'a@a.nl', password: 'a', virtue: 5}), success)
console.log('checks passed')
