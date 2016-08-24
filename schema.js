var helpers = require('./helpers')

var extend = helpers.utils.extend, merge = function(a, b) {
  var c = extend({}, a)
  extend(c, b)
  return c
}

var Schema = module.exports = function(v, opts) {
  v = [].concat(v)
  this.v = {checks: {}, tables: {}}
  for (var i = 0; i < v.length; i++) {
    this.extend(v[i])
  }
  this.helpers = extend({}, helpers)
  this.helpers.fn = {}
  this.opts = opts || {}
}
Schema.prototype.functions = function(fns) {
  extend(this.helpers.fn, fns)
}
Schema.prototype.options = function(opts) {
  extend(this.opts, opts)
}
Schema.prototype.defaults = function(table_name, column, data) {
  var t = this.v.tables[table_name]
  if (column) {
    if (t.columns[column].default) {
      return t.columns[column].default(data, this.helpers)
    }
    else {
      return t.defaults(data).column
    }
  }
  if (!t.defaults) {
    t.defaults = function(r) {
      var defaults = {}
      for (var column in t.columns) {
        if (t.columns[column].default) {
          defaults[column] = t.columns[column].default(r, this.helpers)
        }
      }
      return defaults
    }
  }
  return t.defaults(data)
}
Schema.prototype.validateCheckConstraint = function(constraint, data) {
  if (this.v.checks[constraint]) {
    return {success: this.v.checks[constraint](data, this.helpers)}
  }
  else {
    return {error: 'constraint_missing', constraint: constraint}
  }
}
Schema.prototype.extend = function(schema) {
  extend(this.v.checks, schema.checks)
  extend(this.v.tables, schema.tables)
}
Schema.prototype.validate = function(table, data, opts) {
  var t = this.v.tables[table]

  opts = merge(this.opts, opts || {}) 

  if (!t) {
    return {error: 'table_missing'}
  }
  if (!opts.ignoreUnknown) {
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

  if (opts.ignoreEmpty) {
    for (var column in t.columns) {
      if (data[column] == null || data[column] === '') {
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

  if (!opts.ignoreDefaults) {
    var defaults = this.defaults(table, void 0, data)
    data = extend(defaults, data)
  }


  var violated = []

  if (!opts.ignoreEmpty) {
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
    var check_name = checklist[i], check = this.v.checks[check_name]

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

Schema.prototype.assert = function() {
  var v = this.validate.apply(this, arguments)
  if (v.error) {
    var name = v.violated ? v.error + ': ' + v.violated.join(', ') : v.error
    var e = new Error(name)
    extend(e, v)
    throw e
  }
}
