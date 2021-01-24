const fetch = require("node-fetch")
const fs = require("fs")
const { performance } = require("perf_hooks")
const CLI = require('clui');
const Spinner = CLI.Spinner;
const chalk = require('chalk');
const { endpoints } = require("./content");

module.exports = {
    run: async (duration, concurrency, endpointsKeys, images) => {
        //Running benchmark.....
        const benchImages = []
        images.forEach(image => {
            const stats = fs.statSync(`./assets/${image}`)
            const bufferContent = fs.readFileSync(`./assets/${image}`, {
                encoding: "base64"
            });
            benchImages.push({
                fileSizeInBytes: stats.size,
                content: `data:image/${image.includes("jpg") ? "jpeg" : "png"};base64,` + bufferContent
            })
        })
        //add duration, etc to file name
        const writeStream = fs.createWriteStream(`./results/${new Date().toISOString()}.csv`, {
            flags: "a",
        })

        console.log(chalk.green('Starting benchmark'));
        let counter = 0;
        for (let i = 0; i < endpointsKeys.length; i++) {
            console.log(chalk.yellow(`\tStarting endpoint ${endpointsKeys[i]}`));
            for (let j = 0; j < images.length; j++) {
                console.log(chalk.yellow(`\t\tStarting image ${images[j]}`));
                const programStart = performance.now()
                const status = new Spinner(`\t\t\tSending image ${images[j]} to serverless function ${endpointsKeys[i]}...`);
                status.start()
                while ((performance.now() - programStart) < 1000 * 60 * duration) {
                    const start = performance.now()
                    try {
                        const res = await fetch(endpoints[endpointsKeys[i]].url, {
                            method: 'POST',
                            headers: endpointsKeys[i] === "express" ? {
                                "Content-length": benchImages[j].fileSizeInBytes,
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            } : {
                                "Content-length": benchImages[j].fileSizeInBytes,
                            },
                            body: endpointsKeys[i] === "express" ? JSON.stringify({
                                content: benchImages[j].content
                            }) :  benchImages[j].content
                        })
                        const text = await res.text()
                        const [rgb, functionDuration, imageType, imageDimensions] = text.split(";")
                        const end = performance.now()
                        let string = ""
                        if ((rgb.split(",").length - 1) === 2) {
                            string = `${counter},${endpointsKeys[i]},${end - start},${functionDuration},${imageType},${imageDimensions},success\n`
                        } else {
                            string = `${counter},${endpointsKeys[i]},${end - start},-,-,-,failure\n`
                        }
                        writeStream.write(string)
                        counter++
                    }
                    catch (err) {
                        console.log(err)
                    }
                }
                status.stop()
                console.log(chalk.yellow(`\t\tImage ${images[j]} ended`));
            }
            console.log(chalk.yellow(`\tEndpoint ${endpointsKeys[i]} ended\n`));
        }
        console.log(chalk.green('Benchmark ended, all results stored in ./results/1.csv'));
        writeStream.end()
    }
}