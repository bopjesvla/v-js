var alasql = require('../alasql')

var pretty = require('js-object-pretty-print').pretty
var toString = obj => pretty(obj, undefined, undefined, true)

function helpers(userhelpers) {
  // patching for serialization
  var global = alasql.utils.global
  alasql.stdfn.CHAR = function(x) { return String.fromCharCode(x) }
  alasql.utils.global = null

  var helperString = toString({stdfn: alasql.stdfn, utils: alasql.utils, fn: alasql.fn})

  alasql.utils.global = global 

  return helperString
}

function validate(tablename, data, opts) {
  opts = opts || {}, t = tables[tablename]

  if (!t) {
    return {error: 'table_missing'}
  }

  var checks = alasql.utils.extend({}, t.checks)

  function notnull(id) {
    return function(r) { return r[id] != null }
  }

  if (!opts.ignoreEmpty) {
    for (var i = 0; i < t.columns.length; i++) {
      var id = t.columns[i].columnid
      checks['notnull_' + id] = notnull(id)
    }
  }
  
  if (!opts.ignoreDefaults) {
    var defaults = t.defaults(data)
    data = alasql.utils.extend({}, data)
    alasql.utils.extend(data, defaults)
  }

  var didSomething = false,
    violated = []

  if (Array.isArray(opts.constraints)) {
    var _checks = {}
    for (var i = 0; i < opts.constraints.length; i++) {
      var constraint = opts.constraints[i]
      if (!checks[constraint]) {
        return {error: 'constraint_missing', constraint: constraint}
      }
      _checks[constraint] = checks[constraint]
    }
    checks = _checks
  }
  else if (typeof opts.constraints == 'object' && opts.constraints[check.id] === false) {
    for (var i in opts.constraints) {
      var constraint = opts.constraints[i]
      if (!checks[constraint]) {
        return {error: 'constraint_missing', constraint: constraint}
      }
      delete checks[constraint]
    }
  }
  
  checking: for (var id in checks) {
    var check = checks[id]

    if (opts.ignoreEmpty) {
      var fn = check.toString(),
        match, pattern = /r\['(.*?)'\]/g

        while (match = pattern.exec(fn)) {
          if (data[match[1]] == null || data[match[1]] === '') {
            continue checking
          }
        }
    }

    if (!check(data)) {
      violated.push(id)

      if (!opts.checkAll) {
        return {error: 'constraint_violated', violated: violated} 
      }
    }
  }

  if (violated.length) {
    return {error: 'constraint_violated', violated: violated} 
  }

  return {success: true}
}

var validator = validate.toString()

module.exports = function(sql, opts) {
  if (opts.fn) {
    alasql.fn = opts.fn
  }
  alasql(sql)

  var tables = {}
  for (name in alasql.tables) {
    var t = alasql.tables[name]
    var defaultfns = 'return {'+t.defaultfns+'}';
    var checks = {}, columns = {}
    for (var i = 0; i < t.columns.length; i++) {
      columns[t.columns[i].id] = t.columns[i]
    }
    for (var i = 0; i < t.checks.length; i++) {
      checks[t.checks[i].id] = t.checks[i].fn
    }
    tables[name] = {columns: t.columns, checks: checks }
    if (t.defaultfns)
      tables[name].defaults = new Function('r,db,params', defaultfns)
  }

  var exports = opts.embedValidator ? validate : '{}'

  var _module = 'var tables, alasql = ' + helpers() + '\n\n'
  _module += 'module.exports = ' + exports + '\n\n'
  _module += 'module.exports.default = module.exports\n\n'
  _module += 'tables = module.exports.tables = ' + toString(tables)
  return _module
}
