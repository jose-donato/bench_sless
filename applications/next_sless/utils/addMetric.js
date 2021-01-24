const url="https://sa-bench.herokuapp.com/api/v1"
//const scenario = "next-next"
export function addMetric(duration, metric, scenario, imageType, imageDimensions) {
    fetch(`${url}/scenario/${scenario}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageType, imageDimensions, duration, metric, env: process.env.NODE_ENV })
    });
}