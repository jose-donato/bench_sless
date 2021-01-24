// /.netlify/functions/dominantColor

const { PNG } = require('pngjs/browser')
const str = require('string-to-stream')
const jpeg = require('jpeg-js')
global.atob = require("atob");
global.Blob = require('node-blob');
const { performance } = require("perf_hooks")
const express = require('express')

function base64ToArrayBuffer(base64) {
  var binary_string = atob(base64);
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

function meanRgba(w, h, matrix) {
  const size = w * h
  const rgb = [0, 0, 0]
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var idx = (w * y + x) << 2
      rgb[0] += matrix[idx]
      rgb[1] += matrix[idx + 1]
      rgb[2] += matrix[idx + 2]
    }
  }
  return [Math.floor(rgb[0] / size), Math.floor(rgb[1] / size), Math.floor(rgb[2] / size)]
}

const app = express()
const port = 3003

app.use(express.json({limit: "15mb"}));

app.get("/echo", (req, res) => res.send("Hello world"))

app.post('/api/dominantColor', async (req, res) => {
  const start = performance.now()
  const [data, base64] = req.body.content.split(',')

  if (data === 'data:image/jpeg;base64') {
    const rawImageData = jpeg.decode(base64ToArrayBuffer(base64))
    const mean = meanRgba(rawImageData.width, rawImageData.height, rawImageData.data).toString();
    const end = performance.now()
    const duration = end - start
    return res.status(200).send(`${mean};${duration};jpeg;${rawImageData.width}x${rawImageData.height}`)
  }

  if (data === 'data:image/png;base64') {
    return await new Promise((ok) => {
      str(base64ToArrayBuffer(base64))
        .pipe(
          new PNG({
            filterType: 4,
          })
        )
        .on('parsed', function () {
          const mean = meanRgba(this.width, this.height, this.data).toString()
          const end = performance.now()
          const duration = end - start
          ok(res.status(200).send(`${mean};${duration};png;${this.width}x${this.height}`))
        })
    })
  }
  return res.status(400).send("format not supported")
})


app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})