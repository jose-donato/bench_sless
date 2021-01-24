import { PNG } from 'pngjs/browser'
import str from 'string-to-stream'
import jpeg from 'jpeg-js'

const url = "https://sa-bench.herokuapp.com/api/v1"
const scenario1 = "workers-workers_sless"
const scenario2 = "workers_sless"
/*
async function addMetric(duration, metric = "m1") {
  const res = fetch(`${url}/scenario/${scenario}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ duration, metric, env: process.env.NODE_ENV })
  })
}*/

function base64ToArrayBuffer(base64) {
  var binary_string = atob(base64)
  var len = binary_string.length
  var bytes = new Uint8Array(len)
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})



async function handleRequest({ request }) {
  try {
    if (request.method === 'GET') {
      const res = new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Img color</title>
        </head>
        <body>
          Upload an image (JPEG or PNG):
          <input type="file" onchange="post()"/>
          <p>Duration <span id="duration"></span></p>
          <script>
            function post() {
              var file = document.querySelector('input[type=file]').files[0];
              var reader = new FileReader();

              reader.addEventListener('load', function () {
                const start = performance.now()
                fetch(location.href, {
                  method: "POST",
                  body: reader.result
                })
                  .then(res => res.text())
                  .then(text => {
                    const [rgb, functionDuration, imageType, imageDimensions] = text.split(";")
                    const end = performance.now()
                    const duration = end - start;
                    document.getElementById("duration").textContent = duration;
                    document.body.style.backgroundColor = "rgb(" + rgb + ")";
                    fetch("${url}/scenario/${scenario1}", {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ imageType, imageDimensions, duration, metric: "m1", env: !window.location.host.includes("localhost") ? "production" : "development" })
                    })
                    fetch("${url}/scenario/${scenario2}", {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ imageType, imageDimensions, duration: functionDuration, metric: "m2", env: !window.location.host.includes("localhost") ? "production" : "development" })
                    })
                  });
              }, false);

              if (file) {
                reader.readAsDataURL(file);
              }
            }
          </script>
        </body>
      </html>
    `)
      res.headers.set('content-type', 'text/html')
      return res
    }

    if (request.method === 'POST') {
      const start = Date.now()
      const [data, base64] = (await request.text()).split(',')

      if (data === 'data:image/jpeg;base64') {
        var rawImageData = jpeg.decode(base64ToArrayBuffer(base64))
        const mean = meanRgba(rawImageData.width, rawImageData.height, rawImageData.data).toString();
        const end = Date.now()
        const duration = end - start
        return new Response(`${mean};${duration};jpeg;${rawImageData.width}x${rawImageData.height}`)
      }

      if (data === 'data:image/png;base64') {
        return await new Promise(ok => {
          str(base64ToArrayBuffer(base64))
            .pipe(
              new PNG({
                filterType: 4,
              })
            )
            .on('parsed', function () {
              const mean = meanRgba(this.width, this.height, this.data).toString()
              const end = Date.now()
              const duration = end - start
              ok(new Response(`${mean};${duration};png;${this.width}x${this.height}`))
            })
        })
      }

      return new Response('unsupported: ' + data, { status: 400 })
    }

    return new Response('not found', { status: 404 })
  } catch (err) {
    console.log(err)
    return new Response(err.stack, { status: 500 })
  }
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
