var fn = module.exports = {
    char_length: function(x) {
        return typeof x == 'string' ? x.length : void 0
    },
    length: function(x) {
        return x && x.length ? x.length : void 0
    },
    nextval: function(seq) {
        return 1
    },
    version: function() {
        return 'app'
    },
    strpos: function(str, substr) {
        return str.indexOf ? str.indexOf(substr) : void 0
    }
}
fn.length = fn.char_length
