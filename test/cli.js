import {EventEmitter as EE} from 'events'

import test from 'tape'
import through from 'through2'
import proxyquire from 'proxyquire'

const fsStub = {}
const libStub = createLibMock()

const cli = proxyquire(
  '../src/cli',
  {'fs': fsStub, './': libStub.mock}
)

test('correctly parses arguments, calls ready', t => {
  t.plan(5)

  const args = '--start 20 --stop 80 --mode hard file.txt'
  const input = through()

  let filename

  input.isTTY = true

  fsStub.createReadStream = (fname) => {
    filename = fname

    return through()
  }

  libStub.once('instantiated', (stream, argv) => {
    t.equal(argv.start, 20)
    t.equal(argv.stop, 80)
    t.equal(argv.mode, 'hard')

    process.nextTick(() => stream.end())
  })

  cli(input, through(), args.split(' '), err => {
    t.notOk(err)
    t.ok(filename.indexOf('file.txt') !== -1)

    libStub.end()
  })
})

test('uses stdin as input when not TTY', t => {
  t.plan(1)

  const args = '--start 20 --stop 80 --mode hard file.txt'
  const input = through()

  fsStub.createReadStream = () => through()

  libStub.once('instantiated', (stream, argv) => {
    process.nextTick(() => input.end())
  })

  cli(input, through(), args.split(' '), err => {
    t.notOk(err)

    libStub.end()
  })
})

test('uses first param as stop, still respects file', t => {
  t.plan(3)

  const args = '80 file.txt'
  const input = through()

  let filename

  input.isTTY = true

  fsStub.createReadStream = (fname) => {
    filename = fname

    return through()
  }

  libStub.once('instantiated', (stream, argv) => {
    t.equal(argv.stop, 80)

    process.nextTick(() => stream.end())
  })

  cli(input, through(), args.split(' '), err => {
    t.notOk(err)
    t.ok(filename.indexOf('file.txt') !== -1)

    libStub.end()
  })
})

test('sets help and returns immediately', t => {
  t.plan(2)

  const args = '--help'

  fsStub.createReadStream = () => t.fail('should not call fs')

  libStub.once('instantiated', () => t.fail('should not call lib'))

  cli(through(), through(), args.split(' '), (err, argv) => {
    t.notOk(err)
    t.ok(argv.help)

    libStub.end()
  })
})

test('sets version and returns immediately', t => {
  t.plan(2)

  const args = '--version'

  fsStub.createReadStream = () => t.fail('should not call fs')

  libStub.once('instantiated', () => t.fail('should not call lib'))

  cli(through(), through(), args.split(' '), (err, argv) => {
    t.notOk(err)
    t.ok(argv.version)

    libStub.end()
  })
})

test('fails when stop is not set', t => {
  t.plan(2)

  const args = ['file.txt']

  fsStub.createReadStream = () => t.fail('should not call fs')

  libStub.once('instantiated', () => t.fail('should not call lib'))

  cli(through(), through(), args, (err, argv) => {
    t.ok(err)
    t.equal(err.badParam, 'stop')

    libStub.end()
  })
})

test('fails when param is not an integer', t => {
  t.plan(2)

  const args = '--stop beep'

  fsStub.createReadStream = () => t.fail('should not call fs')

  libStub.once('instantiated', () => t.fail('should not call lib'))

  cli(through(), through(), args.split(' '), (err, argv) => {
    t.ok(err)
    t.equal(err.badParam, 'integer')

    libStub.end()
  })
})

test('fails when mode is not expected value', t => {
  t.plan(2)

  const args = '--mode beep --stop 20'

  fsStub.createReadStream = () => t.fail('should not call fs')

  libStub.once('instantiated', () => t.fail('should not call lib'))

  cli(through(), through(), args.split(' '), (err, argv) => {
    t.ok(err)
    t.equal(err.badParam, 'mode')

    libStub.end()
  })
})

test('fails when no file is specified in TTY', t => {
  t.plan(2)

  const args = '--mode soft --stop 20'
  const input = through()

  input.isTTY = true

  fsStub.createReadStream = () => t.fail('should not call fs')

  cli(input, through(), args.split(' '), (err, argv) => {
    t.ok(err)
    t.equal(err.badParam, 'file')

    libStub.end()
  })
})

function createLibMock () {
  const events = new EE()

  events.mock = mock
  events.end = () => events.removeAllListeners()

  return events

  function mock (...args) {
    const stream = through()

    events.emit('instantiated', stream, ...args)

    return stream
  }
}
