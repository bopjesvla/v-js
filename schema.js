var helpers = require('./helpers')

var extend = helpers.utils.extend, merge = function(a, b) {
  var c = extend({}, a)
  extend(c, b)
  return c
}

var Table = function(schema, name, opts, helpers) {
  this.schema = schema
  this.name = name
  this.opts = opts
  this.helpers = helpers
}

var Schema = module.exports = function(schemas, opts) {
  schemas = [].concat(schemas)
  var schemaHelpers = extend({}, helpers)
  schemaHelpers.fn = {}
  opts = opts || {}
  var schema = {checks: {}, tables: {}, domains: {}}

  var self = function(tableName) {
    return new Table(schema, tableName, opts, schemaHelpers)
  }

  self.helpers = schemaHelpers

  self.extend = function(newschema) {
    extend(schema.checks, newschema.checks)
    extend(schema.tables, newschema.tables)

    for (var table in newschema.tables || {}) {
      var t = schema.tables[table], checks = {}
      for (var c = 0; c < t.checks.length; c++) {
        var check = t.checks[c]
        checks[check] = []
      }
      for (var column in t.columns) {
        var col = t.columns[column]
        for (var c = 0; c < (col.checks || []).length; c++) {
          var check = col.checks[c]
          checks[check].push(column)
        }
      }
      t.checks = checks
    }

    extend(schema.domains, newschema.domains)
  }

  for (var i = 0; i < schemas.length; i++) {
    self.extend(schemas[i])
  }

  self.functions = function(fns) {
    extend(schemaHelpers.fn, fns)
  }
  self.options = function(_opts) {
    extend(opts, _opts)
  }
  self.validateCheckConstraint = function(constraint, data) {
    if (schema.checks[constraint]) {
      return {success: schema.checks[constraint](data, schemaHelpers)}
    }
    else {
      return {error: 'constraint_missing', constraint: constraint}
    }
  }
  return self
}

Table.prototype.defaults = function(column, data) {
  var t = this.schema.tables[this.name]
  if (typeof column != 'string') {
    data = column
    column = null
  }
  data = data || {}
  if (column) {
    if (t.columns[column].default) {
      return t.columns[column].default(data, this.helpers)
    }
    else {
      return t.defaults(data).column
    }
  }
  if (t.defaults) {
    var defaults = t.defaults(data, this.helpers)
    for (var column in t.columns) {
      if (!(column in defaults)) {
        defaults[column] = void 0
      }
    }
    return defaults
  }
  var defaults = {}
  for (var column in t.columns) {
    if (t.columns[column].default) {
      defaults[column] = t.columns[column].default(data, this.helpers)
    }
    else {
      var domain = t.columns[column].domain
      defaults[column] = domain && this.schema.domains[domain].default ? this.schema.domains[domain].default(data, this.helpers) : void 0
    }

  }
  return defaults
}
Table.prototype.e = function(error, violated) {
  var e = {error: error, table: this.name}
  if (violated) {
    e.violated = Array.isArray(violated) ? violated : [violated]
  }
  return e
}
Table.prototype.validate = function(data, opts) {
  var t = this.schema.tables[this.name]

  opts = merge(this.opts, opts || {}) 

  if (!t) {
    return this.e('table_missing')
  }

  if (opts.unknown !== false) {
    var unknown = []

    for (var field in data) {
      if (!t.columns[field]) {
        unknown.push(field)
      }
    }

    if (unknown.length) {
      return this.e('unknown_field', unknown)
    }
  }

  var checklist = Object.keys(t.checks), checkobj = {}

  if (Array.isArray(opts.checks)) {
    checklist = opts.checks
  }
  else if (opts.checks != null) {
    checkobj = opts.checks
  }

  if (opts.defaults !== false) {
    var defaults = this.defaults(data)
    data = extend(defaults, data)
  }

  if (opts.partial) {
    for (var column in t.columns) {
      if (data[column] == null) {
        var checks = t.columns[column].checks
        for (var i = 0; i < checks.length; i++) {
          checkobj[checks[i]] = false
        }
      }
    }
  }

  if (opts.columns) {
    for (var column in t.columns) {
      if (opts.columns.indexOf(column) == -1) {
        var checks = t.columns[column].checks
        for (var i = 0; i < checks.length; i++) {
          checkobj[checks[i]] = false
        }
      }
    }
  }


  var violated = []

  if (!opts.partial && opts.notnull !== false) {
    for (var c in t.columns) {
      var column = t.columns[c]
      if ((!opts.columns || opts.columns.indexOf(c) > -1) && column.notnull && data[c] == null) {
        violated.push({name: 'not_null', columns: [c]})
      }
    }
  }

  for (var i = 0; i < checklist.length; i++) {
    var check_name = checklist[i], check = this.schema.checks[check_name]

    if (!check) {
      return {error: 'constraint_missing', constraint: check_name}
    }

    if (checkobj[check_name] !== false) {
      var result = check(data, this.helpers)
      if (result !== true && result != null) {
        violated.push({name: check_name, columns: t.checks[check_name] || []})
      }
    }
  }

  if (opts.domains !== false) {
    for (var column in t.columns) {
      var domain = t.columns[column].domain
      if (domain) {
        for (var i = 0; i < this.schema.domains[domain].checks.length; i++) {
          var check_name = this.schema.domains[domain].checks[i], check = this.schema.checks[check_name]
          
          if (!check) {
            return {error: 'constraint_missing', constraint: check_name}
          }

          var result = check(data[column], this.helpers)
          if (result !== true && result != null) {
            violated.push({name: check_name, columns: [column]})
          }

        }
      }
    }
  }

  if (violated.length) {
    return this.e('constraint_violated', violated)
  }

  return {success: true}
}

Table.prototype.assert = function() {
  var v = this.validate.apply(this, arguments), e
  if (v.error == 'constraint_violated') {
    e = new Error(v.error + ': ' + v.violated.map(v => v.name + ' by ' + v.columns.join(', ')).join(', '))
  }
  else if (!v.success) {
    e = new Error(v.error + (v.violated ? ': ' + v.violated.join(', ') : ''))
  }

  extend(e, v)
  throw e
}

module.exports.Table = Table
