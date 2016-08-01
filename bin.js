var v = require('.')
var fs = require('fs')
var path = require('path')

var args = require('yargs')
    .alias('c', 'client')
    .alias('U', 'client.user')
    .alias('h', 'client.host')
    .alias('d', 'client.database')
    .alias('t', 'tables')
    .argv

var cb = (err, res) => {
    if (err) {
        throw err
    }
    if (args.out) {
        fs.writeFileSync(path.join(process.cwd(), args.out), res)
    }
    else {
        console.log(res)
    }
}

v(args, cb)
