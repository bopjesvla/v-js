var alasql = require('../alasql')

// patching for serialization
var global = alasql.utils.global
alasql.stdfn.CHAR = function(x) { return String.fromCharCode(x) }
alasql.utils.global = null

var pretty = require('js-object-pretty-print').pretty
var toString = obj => pretty(obj, undefined, undefined, true)

var alafns = toString({stdfn: alasql.stdfn, utils: alasql.utils})

alasql.utils.global = global

function validate(tablename, data, opts) {
  opts = opts || {}

  var tablechecks = checks[tablename],
    didSomething = false,
    violated = []

  if (!tablechecks) {
    return {error: 'table_missing'}
  }

  checking: for (var i = 0; i < tablechecks.length; i++) {
    var check = tablechecks[i]

    if (opts.ignoreEmpty) {
      var fn = check.fn.toString(),
        match, pattern = /r\['(.*?)'\]/g
      while (match = pattern.exec(fn)) {
        if (data[match[1]] == null || data[match[1]] === '') {
          continue checking
        }
      }
    }

    if (!opts.constraint || check.id == opts.constraint) {
      didSomething = true
      if (!check.fn(data)) {
        violated.push(check.id)

        if (!opts.checkAll) {
          return {error: 'constraint_violated', violated: violated} 
        }
      }
    }
  }

  if (opts.constraint && !didSomething) {
    return {error: 'constraint_missing'}
  }

  if (violated.length) {
    return {error: 'constraint_violated', violated: violated} 
  }

  return {success: true}
}

var validator = validate.toString()

module.exports = function(sql) {
  alasql(sql)

  var checks = {}, tables = alasql.tables
  for (name in tables) {
    checks[name] = tables[name].checks.filter(check => !check.fk)
  }

  return 'var checks, alasql = ' + alafns + '; module.exports = ' + validator + '\n\nmodule.exports.default = module.exports\n\nchecks = module.exports.checks = ' + toString(checks)
}
