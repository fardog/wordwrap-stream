import fs from 'fs'
import path from 'path'

import minimist from 'minimist'

import wordwrap from './'

export default cli

function cli (input, output, args, ready) {
  const cliOpts = {
    alias: {
      'stop': 'x',
      'start': 's',
      'mode': 'm'
    },
    integer: ['start', 'stop'],
    boolean: ['version', 'help'],
    string: ['mode'],
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
    return ready(new Error('`stop` or `start` parameters expect an integer'))
  }

  // ensure 'mode' is one of soft/hard
  if (argv.mode && !(new Set(['soft', 'hard'])).has(argv.mode)) {
    return ready(new Error('`mode` must be one of `soft, hard`'))
  }

  const wrap = wordwrap(argv)
  let file

  // if we're not a TTY, read from stdin, else use positional arg as path
  if (!input.isTTY) {
    file = input
  } else if (argv._[0]) {
    file = fs.createReadStream(path.resolve(process.cwd(), argv._[0]))
  } else {
    return ready(new Error('no file or pipe specified for input'))
  }

  wrap.on('end', () => ready())

  file.pipe(wrap).pipe(output)
}
