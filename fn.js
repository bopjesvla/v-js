module.exports = {
    char_length: function(x) {
        return typeof x == 'string' ? x.length : NaN
    },
    nextval: function(seq) {
        return 1
    },
    version: function() {
        return 'v.js'
    },
}
