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
  var schema = {checks: {}, tables: {}}

  var self = function(tableName) {
    return new Table(schema, tableName, opts, schemaHelpers)
  }

  self.extend = function(newschema) {
    extend(schema.checks, newschema.checks)
    extend(schema.tables, newschema.tables)
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
  if (column) {
    if (t.columns[column].default) {
      return t.columns[column].default(data, this.helpers)
    }
    else {
      return t.defaults(data).column
    }
  }
  var defaults = t.defaults ? t.defaults(data) : {}
  for (column in t.columns) {
    if (!(column in defaults)) {
      defaults[column] = t.columns[column].default ? t.columns[column].default(data, this.helpers) : null
    }
  }
  return defaults
}
Table.prototype.validate = function(data, opts) {
  var t = this.schema.tables[this.name]

  opts = merge(this.opts, opts || {}) 

  if (!t) {
    return {error: 'table_missing'}
  }
  if (opts.unknown !== false) {
    for (var field in data) {
      if (!t.columns[field]) {
        return {error: 'unknown_field', violated: [field]}
      }
    }
  }

  var checklist = t.checks, checkobj = {}

  if (Array.isArray(opts.checks)) {
    checklist = opts.checks
  }
  else if (typeof opts.checks == 'object') {
    checkobj = opts.checks
  }

  if (opts.empty === false) {
    for (column in t.columns) {
      if (data[column] == null || data[column] === '') {
        var checks = t.columns[column].checks
        for (var i = 0; i < checks.length; i++) {
          checkobj[checks[i]] = false
        }
      }
    }
  }

  if (opts.columns) {
    for (column in t.columns) {
      if (opts.columns.indexOf(column) == -1) {
        var checks = t.columns[column].checks
        for (var i = 0; i < checks.length; i++) {
          checkobj[checks[i]] = false
        }
      }
    }
  }

  if (opts.defaults !== false) {
    var defaults = this.defaults(void 0, data)
    data = extend(defaults, data)
  }


  var violated = []

  if (opts.empty === false) {
    for (var column in t.columns) {
      if ((!opts.columns || opts.columns.indexOf(column) > -1) && t.columns[column].notnull && (data[column] == null || opts.notNullNotEmpty && data[column] === '')) {
        violated.push(column + '_not_null')
        if (!opts.checkAll) {
          return {error: 'constraint_violated', violated: violated} 
        }
      }
    }
  }

  for (var i = 0; i < checklist.length; i++) {
    var check_name = checklist[i], check = this.schema.checks[check_name]

    if (!check) {
      return {error: 'constraint_missing', constraint: check_name}
    }

    if (checkobj[check_name] !== false && !check(data, this.helpers)) {
      violated.push(check_name)

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

Table.prototype.assert = function() {
  var v = this.validate.apply(this, arguments)
  if (v.error) {
    var name = v.violated ? v.error + ': ' + v.violated.join(', ') : v.error
    var e = new Error(name)
    extend(e, v)
    throw e
  }
}

module.exports.Table = Table
