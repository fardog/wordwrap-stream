const fs = require('fs')
const path = require('path')

const minimist = require('minimist')

const wordwrap = require('./')

module.exports = cli

function cli (input, output, args, ready) {
  const cliOpts = {
    alias: {
      'stop': 'x',
      'start': 's',
      'hard': 'h'
    },
    integer: ['start', 'stop'],
    boolean: ['version', 'help', 'hard'],
    default: {
      'mode': 'soft'
    }
  }
  const argv = minimist(args, cliOpts)

  if (argv.help || argv.version) {
    return ready(null, argv)
  }

  // use first positional argument as a stop, if not set via flags
  if (!argv.stop && argv._.length && Number.isInteger(argv._[0])) {
    argv.stop = argv._.splice(0, 1)[0]
  }

  // verify integer expecting args have an integer
  if (cliOpts.integer.some(opt => argv[opt] && !Number.isInteger(argv[opt]))) {
    const err = new Error('`stop` or `start` parameters expect an integer')

    err.badParam = 'integer'

    return ready(err)
  }

  if (!argv.stop) {
    const err = new Error('`stop` is a required parameter')

    err.badParam = 'stop'

    return ready(err)
  }

  if (argv.hard) {
    argv.mode = 'hard'
  }

  const wrap = wordwrap(argv)
  let file

  // if we're not a TTY, read from stdin, else use positional arg as path
  if (!input.isTTY) {
    file = input
  } else if (argv._[0]) {
    file = fs.createReadStream(path.resolve(process.cwd(), argv._[0]))
  } else {
    const err = new Error('no file or pipe specified for input')

    err.badParam = 'file'

    return ready(err)
  }

  wrap.on('end', () => ready())

  file.pipe(wrap).pipe(output)
}
