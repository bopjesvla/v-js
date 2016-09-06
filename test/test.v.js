var Schema = require('v-js/schema')
  var schema = new Schema([
    {
        tables: {
            attributes: {
                columns: {
                    numeric_precision: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: null,
                        domain: "cardinal_number"
                    },
                    is_nullable: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: null,
                        domain: "yes_or_no"
                    }
                },
                checks: [

                ]
            },
            check_constraints: {
                columns: {
                    check_clause: {
                        default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
},
                        notnull: false,
                        checks: null,
                        domain: "character_data"
                    }
                },
                checks: [

                ]
            }
        },
        checks: {
            yes_or_no_check: function anonymous(r,alasql,params
/**/) {
var y; return (((y=[(alasql.stdfn.CONVERT(([(alasql.stdfn.CONVERT('YES',{dbtypeid:"character varying",dbsize:undefined,style:undefined})), (alasql.stdfn.CONVERT('NO',{dbtypeid:"character varying",dbsize:undefined,style:undefined}))]),{dbtypeid:"text[[]]",dbsize:undefined,style:undefined})), (alasql.stdfn.CONVERT((r),{dbtypeid:"text",dbsize:undefined,style:undefined}))], y.some(function(e){return e === void 0}) ? void 0 : y[0].some(function(b){return (y[1])===b}))))
},
            cardinal_number_domain_check: function anonymous(r,alasql,params
/**/) {
var y; return (((y=[(r), (0)], y.some(function(e){return e === void 0}) ? void 0 : (y[0]>=y[1]))))
}
        },
        domains: {
            yes_or_no: {
                checks: [
                    "yes_or_no_check"
                ],
                default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
}
            },
            cardinal_number: {
                checks: [
                    "cardinal_number_domain_check"
                ],
                default: function anonymous(r,alasql,params
/**/) {
var y; return undefined
}
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
                        ],
                        type: "TEXT"
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