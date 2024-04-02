/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
const fs = require('fs');
const path = require('path')

var fsh = {

  delete: function (filename) {
    return new Promise(function (resolve, reject) {
      fs.unlink(filename, function (err) {
        resolve(filename);
      });
    });
  },

  mkdir: function (path) {
    return new Promise(function (resolve, reject) {
      fs.mkdir(path, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  move: function (oldPath, newPath) {
    return new Promise(function (resolve, reject) {
      fs.rename(oldPath, newPath, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(newPath);
        }
      });
    });
  },

  write: function (filename, data, type = "UTF-8") {
    return new Promise(function (resolve, reject) {
      if (!(typeof data === 'string' || data instanceof String || data instanceof Buffer)) {
        data = JSON.stringify(data, null, " ");
      }
      fs.mkdir(path.dirname(filename), { recursive: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          fs.writeFile(filename, data, type, function (err) {
            if (err) {
              console.log(filename);
              reject(err);
            } else {
              resolve(data);
            }
          })
        }
      });
    });
  },

  read: function (filename) {
    return new Promise(function (resolve, reject) {
      fs.readFile(filename, 'UTF-8', function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },

  fileExists: function (filename) {
    try {
      if (fs.statSync(filename).isFile()) {
        return true;
      }
      fs.accessSync(filename, fs.constants.R_OK);
      return true;
    } catch (err) {
      return false;
    }
  },

  getFiles: function (folder) {
    return new Promise(function (resolve, reject) {
      if (fs.existsSync(folder)) {
        fs.readdir(folder, (err, subdirs) => {
          Promise.all(subdirs.map(subdir => {
            const res = path.join(folder, subdir);
            return (fs.statSync(res)).isDirectory() ? fsh.getFiles(res) : res;

          })).then(files => {
            resolve(files.reduce((a, f) => a.concat(f), []));
          })
        });
      } else {
        resolve([]);
      }
    });
  }

};

module.exports = fsh;
