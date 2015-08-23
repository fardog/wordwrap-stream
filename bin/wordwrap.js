#!/usr/bin/env node
var fs = require('fs')
var path = require('path')

var cli = require('../lib/cli')

cli(process.stdin, process.stdout, process.argv.slice(2), function (err, _args) {
  if (err) {
    console.error(
      'You had an error in your syntax. Please run with `--help` for usage.',
      `\n${err.message}`
    )

    return process.exit(1)
  }

  var args = _args || {}

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
