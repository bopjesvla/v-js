var alasql = require('../alasql')
var fs = require('fs')

var getSchema = fs.readFileSync('./getschema.sql', 'utf8')

var v = module.exports

v.default = v

v.helpers = function() {
  // patching for serialization
  var global = alasql.utils.global
  alasql.stdfn.CHAR = function(x) { return String.fromCharCode(x) }
  alasql.utils.global = null

  var helperString = toString({stdfn: alasql.stdfn, utils: alasql.utils})

  alasql.utils.global = global

  return helperString
}

v.SQLExprToFunction = function(sql) {
  var expr = alasql.parse('= ' + sql),
    js = 'var y; return ' + expr.statements[0].expression.toJS('r', '')
  return new Function('r,alasql,params', js) 
}

v.fromSQL = function(sql) {
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
      tables[name].defaults = new Function('r,alasql', defaultfns)
    }
  } 
  return {tables, checks}
}

v.fromPG = function(client, opts, cb) {
  var query = (sql, cb) => {
    client.query(sql, (err, res) => {
      if (err) {
        throw err
      }
      if (res.rows) {
        res = res.rows
      }
      cb(res)
    })
  }
  var where = `table_schema = '${opts.schema || 'public'}'`
  var tables = {}, checks = {}
  if (opts.tables) {
    where += ` and (`
    var tables = Array.isArray(opts.tables) ? opts.tables : Object.keys(opts.tables)

    where += Object.keys(opts.tables).map(t => {
      var cond = `table_name = '${t}'`
      if (Array.isArray(opts.tables[t])) {
        cond += ` and column_name in ('${
          opts.tables[t].join(`','`)
        }')`
      }
      return cond
    }).join(` or `)

    where += `)`
  }
  console.log(where)
  query(getSchema.replace('1=1', where), res => {
    var columns = res[0].columns
    for (var column of columns) {
      var tablename = column.table_name
      if (!tables[tablename]) {
        tables[tablename] = {columns: {}, checks: []}
      }
      tables[tablename].columns[column.column_name] = {
        default: v.SQLExprToFunction(column.column_default),
        notnull: column.is_nullable == 'NO',
        checks: column.checks
      }
    }
    for (var table of res[0].tables) {
      tables[table.table_name].checks = table.checks
    }
    for (var check in res[0].checks) {
      checks[check] = v.SQLExprToFunction(res[0].checks[check])
    }
    cb({tables, checks})
  })
}
