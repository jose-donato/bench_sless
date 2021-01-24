const fs = require('fs');
const path = require('path');

module.exports = {
  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  getDirectoryFiles: (filePath) => {
    const files = []
    fs.readdirSync(filePath).forEach(file => {
      files.push(file)
    });
    return files
  }
};