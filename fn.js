var fn = module.exports = {
    char_length: function(x) {
        return typeof x == 'string' ? x.length : NaN
    },
    length: function(x) {
        return x && x.length ? x.length : NaN
    },
    nextval: function(seq) {
        return 1
    },
    version: function() {
        return 'app'
    },
    strpos: function(str, substr) {
        return str.indexOf ? str.indexOf(substr) : NaN
    }
}
fn.length = fn.char_length
