// /.netlify/functions/dominantColor

const { PNG } = require('pngjs/browser')
const str = require('string-to-stream')
const jpeg = require('jpeg-js')
global.atob = require("atob");
global.Blob = require('node-blob');
const { performance } = require("perf_hooks")
const fetch = require('node-fetch');

/*const url = "https://sa-bench.herokuapp.com/api/v1"
const scenario = "gatsby-netlify"
async function addMetric(duration, metric = "m1") {
  await fetch(`${url}/scenario/${scenario}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ duration, metric, env: process.env.NODE_ENV })
  });
}*/


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

exports.handler = async event => {
  const start = performance.now()
  if (event.httpMethod === "POST") {
    const [data, base64] = (await event.body).split(',')

    if (data.includes("jpeg")) {
      var rawImageData = jpeg.decode(base64ToArrayBuffer(base64))
      const mean = meanRgba(rawImageData.width, rawImageData.height, rawImageData.data).toString();
      const end = performance.now()
      const duration = end - start
      //addMetric(duration)
      return {
        statusCode: 200,
        body: `${mean};${duration};jpeg;${rawImageData.width}x${rawImageData.height}`,
      }
    }

    if (data.includes("png")) {
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
            ok({
              statusCode: 200,
              body: `${mean};${duration};png;${this.width}x${this.height}`
            })
          })
      })
    }
    return {
      statusCode: 400,
      body: "format not supported",
    }
  }
  return {
    statusCode: 404,
    body: "not found",
  }
}
