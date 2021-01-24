// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PNG } from 'pngjs/browser'
import str from 'string-to-stream'
import jpeg from 'jpeg-js'
import { performance } from "perf_hooks"

global.atob = require("atob");
global.Blob = require('node-blob');


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


export default async (req, res) => {
  const start = performance.now()
  if (req.method === 'POST') {
    /*const form = new formidable.IncomingForm();
    form.uploadDir = "./";
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
      if(files.image) {
        if(files.image.type) 
      }
    });
    */
    const [data, base64] = (await req.body).split(',')

    if (data === 'data:image/jpeg;base64') {
      var rawImageData = jpeg.decode(base64ToArrayBuffer(base64))
      const mean = meanRgba(rawImageData.width, rawImageData.height, rawImageData.data).toString();
      const end = performance.now()
      const duration = end - start
      return res.status(200).end(`${mean};${duration};jpeg;${rawImageData.width}x${rawImageData.height}`)
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
            ok(res.status(200).end(`${mean};${duration};png;${this.width}x${this.height}`))
          })
      })
    }

    return res.status(400).end("format not supported")
  }

  return res.status(404).end("not found")
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    }
  },
}
