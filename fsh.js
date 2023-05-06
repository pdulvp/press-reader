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
      return new Promise(function(resolve, reject) {
          fs.unlink(filename, function(err) {
              resolve(filename);
          });
      });
    },
  
    move: function (oldPath, newPath) {
      return new Promise(function(resolve, reject) {
          fs.rename(oldPath, newPath, function (err) {
              if (err) {
                  reject(err);
              } else {
                  resolve(newPath);
              }
          });
      });
    },
  
    write: function (filename, data) {
        return new Promise(function(resolve, reject) {
            if (!(typeof data === 'string' || data instanceof String)) {
                data = JSON.stringify(data, null, " ");
            }
            if (!fs.existsSync(path.dirname(filename))){
                fs.mkdirSync(path.dirname(filename), { recursive: true });
            }
            fs.writeFile(filename, data, 'UTF-8', function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    },
    
    append: function (filename, data) {
		return new Promise(function(resolve, reject) {
            if (!(typeof data === 'string' || data instanceof String)) {
                data = JSON.stringify(data, null, " ");
            }
            if (!fs.existsSync(path.dirname(filename))){
                fs.mkdirSync(path.dirname(filename), { recursive: true });
            }
            fs.appendFile(filename, data, 'UTF-8', function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
	},
	
    writeIfChange: function (filename, data) {
        if (!(typeof data === 'string' || data instanceof String)) {
            data = JSON.stringify(data, null, " ");
        }
        if (!fs.existsSync(path.dirname(filename))){
            fs.mkdirSync(path.dirname(filename), { recursive: true });
        }
        if (fsh.fileExists(filename)) {
            return fsh.read(filename).then(e => {
                if (e != data) {
                    return fsh.write(filename, data);
                } else {
                    return Promise.resolve(filename);
                }
            })
        } else {
            return fsh.write(filename, data);
        }
    },

    read: function(filename) {
        return new Promise(function(resolve, reject) {
            fs.readFile(filename, 'UTF-8', function(err, data){
                if (err) {
                    reject(err); 
                } else {
                    resolve(data);
                }
            });
        });
    },
  
    fileExists: function(filename) {
        try {
            return fs.statSync(filename).isFile();

        } catch (err) {
            if (err.code == 'ENOENT') {
                console.log("File does not exist.");
                return false;
            }
            return false;
        }
    },

    getFiles: function(folder) {
        return new Promise(function(resolve, reject) {
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
