var alasql = require('../alasql')
var fs = require('fs')

var pretty = require('js-object-pretty-print').pretty
var toString = obj => pretty(obj, undefined, undefined, true)

var getSchema = fs.readFileSync('./getschema.sql', 'utf8')

function helpers(userhelpers) {
  // patching for serialization
  var global = alasql.utils.global, fn = alasql.fn
  alasql.stdfn.CHAR = function(x) { return String.fromCharCode(x) }
  alasql.utils.global = null
  alasql.fn = userhelpers

  var helperString = toString({stdfn: alasql.stdfn, utils: alasql.utils, fn: alasql.fn})

  alasql.utils.global = global
  alasql.fn = fn

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

module.exports.fromSQL = function(sql, outopts) {
  if (outopts.fn) {
    alasql.fn = outopts.fn
  }

  var tables = {}, checks = {}

  alasql(sql)

  for (var name in alasql.tables) {
    var t = alasql.tables[name]

    for (var column of t.columns) {
      columns[column.id] = {
        notnull: column.notnull,
        checks: []
      }
    }
    for (var check of t.checks) {
      checks[check.id] = check.fn
      var fn = check.fn.toString(),
        match, pattern = /r\['(.*?)'\]/g

        while (match = pattern.exec(fn)) {
          if (columns[match[1]]) {
            columns[match[1]].checks.push(check.id)
          }
        }
    }
    tables[name] = {columns: t.columns, checks: checks }

    if (t.defaultfns) {
      var defaultfns = 'return {'+t.defaultfns+'}';
      tables[name].defaults = new Function('r,db,params', defaultfns)
    }
  } 
  return {tables, checks}
}

module.exports.fromPG = function(client, outopts, cb) {
  var query = (sql, cb) => {
    client.query(sql, (err, res) => {
      if (err) {
        throw err
      }
      if (res.rows) {
        res = res.rows
      }
      gen.next(res)
    })
  }
  var gen = (function*() {
    var tables = {}, checks = {}
    var columns = yield query(getSchema)
    console.log(columns)
    
    for (var column of columns) {
      var tablename = column.table_name
      if (!tables[tablename]) {
        tables[tablename] = {columns: {}, checks: []}
      }
      tables[tablename].columns[column.column_name] = {
        default: column.column_default,
        notnull: !column.is_nullable,
        checks: []
      }
    }

    var table_checks = yield query(`select *
    from information_schema.table_constraints
    where table_schema='public' and constraint_type='CHECK' and constraint_name not like '%\_not\_null'`)

    for (var check of table_checks) {
      var tablename = check.table_name
      tables[tablename].checks.push(check.constraint_name)
    }

    var column_checks = yield query(`select *
    from information_schema.constraint_column_usage
    where table_schema = 'public'`)

    for (var check of column_checks) {
      var tablename = check.table_name
      tables[tablename].columns[check.column_name].checks.push(check.constraint_name)
    }

    var checks = yield query(`select *
    from information_schema.check_constraints
    where constraint_schema = 'public' and constraint_name not like '%\_not\_null'`)

    for (var check of checks) {
      checks[check.constraint_name] = check.check_clause
    }

    cb({tables, checks})
  })()
  gen.next()
}

//return `var tables, alasql = ${helpers()}
//  module.exports = ${exports}
//  module.exports.default = module.exports
//  tables = module.exports.tables = ${toString(tables)}`
