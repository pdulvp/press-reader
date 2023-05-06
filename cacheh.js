/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
const fsh = require('./fsh');
const fs = require('fs');

var cacheh = {
    
    getCache: function (cache, duration, otherwise, fromCache = (e) => {
        return Promise.resolve(e)
    }) {
        if (fsh.fileExists(cache)) {
            statsObj = fs.statSync(cache);
            var currentDate = new Date();
            var creationDate = new Date(statsObj.ctime);
            var difference = currentDate - creationDate; // difference in milliseconds
            
            if (duration == -1 || difference < duration) {
                return fsh.read(cache).then(e => {
                    return fromCache(e);
                });
            } else {
               fs.rmSync(cache);
            }
        }
        
        return otherwise().then(result => {
            return cacheh.setCache(cache, result).then(e => {
                return Promise.resolve(result);
            })
        });
    },

    setCache: function (cache, content) {
        return fsh.write(cache, content);
    }
}

module.exports = cacheh;
