import fs from 'fs'
import path from 'path'

import test from 'tape'
import through from 'through2'
import concat from 'concat-stream'

import lib from '../src'

test('returns a duplex stream', function (t) {
  t.plan(1)

  t.doesNotThrow(() => through().pipe(lib()).pipe(through()))
})

test('streams wrapped words', function (t) {
  t.plan(1)

  const text = 'a cat ran at a hat how is that'
  const instance = lib({stop: 3})

  instance.on('error', (err) => t.fail(err))
  instance.pipe(concat(done))
  instance.write(text)
  instance.end()

  function done (buf) {
    t.equal(buf.toString(), 'a\ncat\nran\nat\na\nhat\nhow\nis\nthat')
  }
})

test('respects stop parameter', function (t) {
  t.plan(1)

  const text = 'a cat ran at a hat how is that'
  const instance = lib({stop: 5})

  instance.on('error', (err) => t.fail(err))
  instance.pipe(concat(done))
  instance.write(text)
  instance.end()

  function done (buf) {
    t.equal(buf.toString(), 'a\ncat\nran\nat a\nhat\nhow\nis\nthat')
  }
})

test('respects start parameter', function (t) {
  t.plan(1)

  const text = 'a cat ran at a hat how is that'
  const instance = lib({start: 1, stop: 6})

  instance.on('error', (err) => t.fail(err))
  instance.pipe(concat(done))
  instance.write(text)
  instance.end()

  function done (buf) {
    t.equal(buf.toString(), ' a\n cat\n ran\n at a\n hat\n how\n is\n that')
  }
})

test('respects hard wrap parameter', function (t) {
  t.plan(1)

  const text = 'a cat ran at a hat how is that'
  const instance = lib({stop: 3, mode: 'hard'})

  instance.on('error', (err) => t.fail(err))
  instance.pipe(concat(done))
  instance.write(text)
  instance.end()

  function done (buf) {
    t.equal(buf.toString(), 'a\ncat\nran\nat\na\nhat\nhow\nis\ntha\nt')
  }
})

test(`exactly correct length string doesn't get buffered`, function (t) {
  t.plan(2)

  const text = 'a cat ran at a hat how is that'
  const instance = lib({stop: 5})

  let count = 0

  instance.on('error', (err) => t.fail(err))

  instance.on('data', function (buf) {
    if (!count) {
      t.equal(buf.toString(), 'a\ncat\nran\nat a\nhat\nhow\nis\nthat')

      instance.end()
      ++count

      setTimeout(() => t.pass('did not emit'), 100)

      return
    }

    t.fail('should not emit a second time')
  })

  instance.write(text)
})

test('can set stream options', function (t) {
  t.plan(2)

  const text = 'a cat a dog an eel'
  const instance = lib({stop: 6}, {objectMode: true})

  instance.on('error', (err) => t.fail(err))
  instance.pipe(concat(done))
  instance.write(text)
  instance.end()

  function done (str) {
    t.ok(typeof str === 'string')
    t.equal(str, 'a cat\na dog\nan eel')
  }
})

test('can wrap from stream', function (t) {
  t.plan(2)

  const file = fs.createReadStream(
    path.join(__dirname, 'fixtures', 'alphabet.txt')
  )
  const instance = lib({stop: 26, mode: 'hard'})

  file.pipe(instance).pipe(concat(done))

  function done (buf) {
    const arr = buf.toString().split('\n')

    t.equal(arr.length, 26)
    t.equal(arr[0].length, 26)
  }
})

test('can wrap large buffer correctly', function (t) {
  t.plan(2)

  let strs = []

  for (let i = 0; i < 10; ++i) {
    let str = ''

    for (let j = 0; j < 1024; ++j) {
      str += i
    }

    strs.push(str)
  }

  const instance = lib({stop: 100, mode: 'hard'}, {highWaterMark: 1})

  instance.pipe(concat(done))

  writeStr(0)

  function writeStr (idx) {
    instance.write(strs[idx])

    if (idx < strs.length - 1) {
      setTimeout(() => writeStr(idx + 1))
    } else {
      instance.end()
    }
  }

  function done (buf) {
    const arr = buf.toString().split('\n')

    t.equal(arr.length, 103)
    t.equal(arr[arr.length - 1].length, 40)
  }
})
