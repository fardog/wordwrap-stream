# wordwrap-stream

Streaming interface to [node-wordwrap][]

[![Build Status](http://img.shields.io/travis/fardog/wordwrap-stream/master.svg?style=flat-square)](https://travis-ci.org/fardog/wordwrap-stream)
[![npm install](http://img.shields.io/npm/dm/wordwrap-stream.svg?style=flat-square)](https://www.npmjs.org/package/wordwrap-stream)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

## Example

```javascript
const fs = require('fs')
const wordwrap = require('wordwrap-stream')

const file = fs.createReadStream('somefile.txt')
const wrap = wordwrap({stop: 20})

file.pipe(wrap)
```

## CLI

```
$ npm install -g wordwrap-stream
$ wordwrap --stop 20 file.txt > wrapped.txt
$ cat file.txt | wordwrap --stop 20 > wrapped.txt
```

## API

`wordwrap(wrapOpts, [streamOpts]) -> transformStream`

- `wrapOpts` (object) an options object, with the following keys; these options
  are passed through to the [wordwrap][node-wordwrap] instance, so check those
  docs for details on each:
    - `stop` (integer) the column at which text should be wrapped
    - `start` (optional, integer, default: `0`) the offset at which to pad out
      lines
    - `mode` (optional, string, default: `soft`) if words that are longer than
      `stop - start` should be forcibly split
- `streamOpts` (optional, object) options passed to the underlying
  [transformStream][]; this is where you could specify the streams
  `highWaterMark` or put it into `objectMode`. Read the
  [stream docs][transformStream] for details.

## License

MIT. See [LICENSE](./LICENSE) for details.

[node-wordwrap]: https://github.com/substack/node-wordwrap
[transformStream]: https://nodejs.org/api/stream.html#stream_class_stream_transform
