var alasql = require('../alasql')
var fs = require('fs')
var path = require('path')

var f = path.join.bind(path, __dirname)

var template = fs.readFileSync(f('./output-template.js'), 'utf8')
var pretty = require('js-object-pretty-print').pretty
var toString = x => pretty(x, void 0, void 0, true)

var getSchema = fs.readFileSync(f('./getschema.sql'), 'utf8')
var pg = require('pg')

var v = module.exports = function(opts, cb) {
  cb = cb || (x => x)

  if (typeof opts == 'string') {
    opts = {sql: opts}
  }
  var vs = []
  if (opts.sql) {
    vs = vs.concat(opts.sql).map(sql => v.fromSQL(sql))
  }
  if (opts.client) {
    v.fromPG(opts, (err, res) => cb(err, v.createModule([res].concat(vs), opts))) 
  }
  else {
    var mod = v.createModule(vs, opts)
    cb(mod) 
    return mod
  }
}

v.default = v

v.createModule = function(vs, opts) {
  opts = opts || {}
  var mod = `var Schema = require('v-js/schema')
  var schema = new Schema(${toString(vs)})

  module.exports = schema
  module.exports.default = schema`

  if (opts.fn !== false) {
    mod += `\n\nschema.functions(require('${opts.fn || 'v-js/fn'}'))`
  }
  return mod
}

v.helpers = function() {
  // patching for serialization
  alasql.stdfn.CHAR = function(x) { return String.fromCharCode(x) }
  var utils = alasql.utils.extend({}, alasql.utils)
  utils.global = null
  for (u in utils) {
    if (/(F|^f)ile/.test(u)) {
      delete utils[u]
    }
  }

  var helperString = toString({stdfn: alasql.stdfn, utils})

  return helperString
}

v.SQLExprToFunction = function(sql) {
  var expr = alasql.parse('= ' + sql),
    js = 'var y; return ' + expr.statements[0].expression.toJS('r', '')
  return new Function('r,alasql,params', js) 
}

v.uid = 1

v.fromSQL = function(sql) {
  var tables = {}, checks = {}

  alasql(`create database x_${++v.uid}; use x_${v.uid}`)
  alasql(sql)

  for (var name in alasql.tables) {
    var t = alasql.tables[name]
    var columns = {}, tablechecks = {}

    for (var column of t.columns) {
      columns[column.columnid] = {
        notnull: !!column.notnull,
        checks: []
      }
    }
    for (var check of t.checks) {
      var id = check.id || `${name}_${column.columnid}_${++v.uid}`

      checks[id] = check.fn
      tablechecks[id] = true

      var fn = check.fn.toString(),
        match, pattern = /r\['(.*?)'\]/g

        while (match = pattern.exec(fn)) {
          if (columns[match[1]]) {
            columns[match[1]].checks.push(id)
          }
        }
    }
    tables[name] = {columns, checks: Object.keys(tablechecks) }

    if (t.defaultfns) {
      var defaultfns = 'return {'+t.defaultfns+'}';
      tables[name].defaults = new Function('r,alasql', defaultfns)
    }
  } 
  return {tables, checks}
}

v.fromPG = function(opts, cb) {
  if (!opts.client || typeof opts.client.query != 'function') {
    opts.client = new pg.Client(opts.client)

    opts.client.connect(err => {
      if (err) {
        throw err
      }
      v.fromPG(opts, (err, res) => {
        opts.client.end()
        cb(err, res)
      })
    })
    return 
  }
  var where = `table_schema = '${opts.schema || 'public'}'`
  var tables = {}, checks = {}
  if (opts.tables) {
    where += ` and (`
    var tablenames = Array.isArray(opts.tables) ? opts.tables : Object.keys(opts.tables)

    where += tablenames.map(t => {
      var cond = `table_name = '${t}'`
      var columns = opts.tables[t]
      if (typeof columns == 'string') {
        columns = columns.split(',')
      }
      if (Array.isArray(columns)) {
        cond += ` and column_name in ('${
          columns.join(`','`)
        }')`
      }
      return cond
    }).join(` or `)

    where += `)`
  }
  opts.client.query(getSchema.replace('1=1', where), (err, res) => {
    if (err) {
      return cb(err)
    }
    if (res.rows) {
      res = res.rows
    }
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
    for (var table of res[0].tables || []) {
      tables[table.table_name].checks = table.checks
    }
    for (var check in res[0].checks) {
      checks[check] = v.SQLExprToFunction(res[0].checks[check])
    }
    cb(void 0, {tables, checks})
  })
}
