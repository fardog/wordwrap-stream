#!/usr/bin/env node
var fs = require('fs')
var path = require('path')

var cli = require('../lib/cli')

cli(process.stdin, process.stdout, process.argv.slice(2), function (err, args) {
  if (err) {
    console.error(err)
    return process.exit(1)
  }

  if (args.version) {
    var pkg = require('../package.json')
    console.log(pkg.version)

    return process.exit(1)
  } else if (args.help) {
    var help = fs.createReadStream(path.resolve(__dirname, 'help.txt'))

    help.on('end', function () {
      process.exit(1)
    })

    help.pipe(process.stderr)
  }
})
