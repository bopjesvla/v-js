var Schema = require('v-js/schema')
  var schema = new Schema([
    {
        tables: {
            check_constraints: {
                columns: {
                    check_clause: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: null
                    }
                },
                checks: [

                ]
            },
            attributes: {
                columns: {
                    is_nullable: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: [
                            "is_nullable_yes_or_no_check"
                        ]
                    },
                    numeric_precision: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: [
                            "numeric_precision_cardinal_number_domain_check"
                        ]
                    }
                },
                checks: [
                    "is_nullable_yes_or_no_check",
                    "numeric_precision_cardinal_number_domain_check"
                ]
            }
        },
        checks: {
            numeric_precision_cardinal_number_domain_check: function anonymous(r,alasql,params
/**/) {
var y; return (((y=[(r['numeric_precision']), (0)], y.some(function(e){return e === void 0}) ? void 0 : (y[0]>=y[1]))))
},
            is_nullable_yes_or_no_check: function anonymous(r,alasql,params
/**/) {
var y; return (((y=[(alasql.stdfn.CONVERT(([(alasql.stdfn.CONVERT('YES',{dbtypeid:"character varying",dbsize:undefined,style:undefined})), (alasql.stdfn.CONVERT('NO',{dbtypeid:"character varying",dbsize:undefined,style:undefined}))]),{dbtypeid:"text[[]]",dbsize:undefined,style:undefined})), (alasql.stdfn.CONVERT((r['is_nullable']),{dbtypeid:"text",dbsize:undefined,style:undefined}))], y.some(function(e){return e === void 0}) ? void 0 : y[0].some(function(b){return (y[1])===b}))))
}
        }
    },
    {
        tables: {
            simple: {
                columns: {
                    a: {
                        notnull: false,
                        checks: [
                            "is_c"
                        ]
                    }
                },
                checks: [
                    "is_c"
                ]
            }
        },
        checks: {
            is_c: function anonymous(r
/**/) {
var y;return (y=[(r['a']), ('c')], y.some(function(e){return e === void 0}) ? void 0 : (y[0]===y[1]))
}
        }
    }
]
)

  module.exports = schema
  module.exports.default = schema

schema.functions(require('v-js/fn'))