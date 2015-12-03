const through = require('through2')
const wordwrap = require('@fardog/wordwrap')

module.exports = wordwrapStream

function wordwrapStream (
  {start = 0, stop, mode = 'soft', lengthFn} = {},
  streamOpts = {}
) {
  const stream = through(streamOpts, write, end)
  const wrap = wordwrap(start, stop, {mode, lengthFn})

  let last

  return stream

  function write (chunk, enc, ready) {
    let chars = chunk.toString()
    let wrapped = wrap((last ? `\n${last}` : '') + chars).split('\n')

    last = wrapped.pop()

    // if the last was an empty string or exactly the right size, put it back
    if (!last || last.length === stop - 1) {
      wrapped.push(last)
      last = null
    }

    stream.push(wrapped.join('\n'))

    ready()
  }

  function end (ready) {
    if (last) {
      const str = `\n${last}`

      stream.push(str)
    }

    ready()
  }
}
