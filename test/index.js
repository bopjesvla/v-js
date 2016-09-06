var assert = require('assert')
var schema = require('./test.v.js')

var success = {success: true}
var violated = vio => ({error: 'constraint_violated', violated: [vio]})

assert.deepEqual(schema('simple').validate({a: 'c'}), success)
assert.deepEqual(schema('simple').validate({a: 'b'}), violated('is_c'))
assert.deepEqual(schema('simple').validate({}), success)
assert.deepEqual(schema('simple').validate({a: void 0}), success)
assert(schema('simple').validate({}, {partial: true}).success)
assert.deepEqual(schema('simple').validate({a: 'c', b: 'd'}), {error: 'unknown_field', violated: ['b']})
assert.deepEqual(schema('simple').defaults(), {a: void 0})

var attrs = schema('attributes')

assert(attrs.validate({is_nullable: 'YES', numeric_precision: 5}), success)
assert.deepEqual(attrs.validate({is_nullable: 'YES', numeric_precision: -5}), violated('numeric_precision_cardinal_number_domain_check'))
assert.deepEqual(attrs.validate({is_nullable: 'YEAH', numeric_precision: 5}), violated('is_nullable_yes_or_no_check'))

