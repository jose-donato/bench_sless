const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const bench = require('./lib/bench');

const files = require("./lib/files")
const inquirer = require('./lib/inquirer');

clear();

console.log(
    chalk.green(
        figlet.textSync('BENCH-SLESS', { horizontalLayout: 'full' })
    )
);

if (!files.directoryExists("assets")) {
    console.log(chalk.red('Provide assets folder with images'));
    process.exit();
}



const run = async () => {
    const configs = await inquirer.benchConfiguration();
    await bench.run(configs.duration, configs.concurrency, configs.endpointsKeys, configs.images)
};

run();