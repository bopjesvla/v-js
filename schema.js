var helpers = require('./helpers')

var merge = function(a, b) {
  var c = helpers.utils.extend({}, a)
  helpers.utils.extend(c, b)
  return c
}

var Schema = module.exports = function(v, opts) {
  this.v = v
  this.helpers = helpers.utils.extend({}, helpers)
  this.helpers.fn = {}
  this.opts = opts || {}
}
Schema.prototype.functions = function(fns) {
  helpers.utils.extend(this.helpers.fn, fns)
}
Schema.prototype.options = function(opts) {
  helpers.utils.extend(this.opts, opts)
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
      for (column in t.columns) {
        if (t.columns[column].default) {
          defaults[column] = t.columns[column].default(r, this.helpers)
        }
      }
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
Schema.prototype.validate = function(table, data, opts) {
  var t = this.v.tables[table]

  opts = merge(this.opts, opts || {}) 

  if (!t) {
    return {error: 'table_missing'}
  }

  for (var field in data) {
    if (!t.columns[field]) {
      return {error: 'invalid_field', violated: field}
    }
  }

  var checklist = t.checks, ignoredChecks = {}

  if (Array.isArray(opts.checks)) {
    checklist = opts.checks
  }
  else {
    if (typeof opts.checks == 'object')
      ignoredChecks = opts.checks
    if (opts.ignoreEmpty) {
      for (column in t.columns) {
        if (data[column] == null || data[column] === '') {
          var checks = t.columns[column].checks
          for (var i = 0; i < ignoredChecks; i++) {
            ignoredChecks[checks[i]] = false
          }
        }
      }
    }
  }
  
  if (!opts.ignoreDefaults) {
    var defaults = this.defaults(table, void 0, data)
    data = this.helpers.utils.extend({}, data)
    this.helpers.utils.extend(data, defaults)
  }


  //console.log(t.columns.created.notnull)

  var violated = []

  if (!opts.ignoreEmpty && !opts.allowNotNull) {
    for (var column in t.columns) {
      if (t.columns[column].notnull && data[column] == null) {
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

    if (ignoredChecks[check_name] !== false && !check(data, this.helpers)) {
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
