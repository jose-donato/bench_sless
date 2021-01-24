const inquirer = require('inquirer');
const {endpoints} = require("./content");
const files = require('./files');

module.exports = {
  benchConfiguration: () => {
    const endpointsKeys = Object.keys(endpoints)
    const images = files.getDirectoryFiles("assets")
    const questions = [
      {
        name: 'duration',
        type: 'number',
        default: 5,
        message: 'Enter the duration in minutes between 1 and 100min (default 5min)',
        validate: function( value ) {
          if (value >= 1 && value <= 100) {
            return true;
          } else {
            return 'Needs to be between 1 and 100 minutes';
          }
        }
      },
      {
        name: 'concurrency',
        type: 'number',
        default: 1,
        message: 'Concurrency value (between 1 and 10)',
        validate: function( value ) {
          if (value >= 1 && value <= 10) {
            return true;
          } else {
            return 'Needs to be between 1 and 10';
          }
        }
      },
      {
        name: 'endpointsKeys',
        type: 'checkbox',
        default: endpointsKeys, 
        choices: endpointsKeys,
        message: 'Select the endpoints',
      },
      {
        name: 'images',
        type: 'checkbox',
        default: images, 
        choices: images,
        message: 'Select the images',
      }
    ];
    return inquirer.prompt(questions);
  },
};