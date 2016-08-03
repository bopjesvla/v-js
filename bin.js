#!/usr/bin/env node

var v = require('.')
var fs = require('fs')
var path = require('path')
var f = path.join.bind(path, process.cwd())

var args = require('yargs')
    .alias('c', 'client')
    .alias('U', 'client.user')
    .alias('h', 'client.host')
    .alias('d', 'client.database')
    .alias('t', 'tables')
    .array('in')
    .argv

if (args.in) {
    args.sql = args.in.map(i => fs.readFileSync(f(i), 'utf8'))
}

var cb = (err, res) => {
    if (err) {
        throw err
    }
    if (args.out) {
        fs.writeFileSync(f(args.out), res)
    }
    else {
        console.log(res)
    }
}

v(args, cb)
