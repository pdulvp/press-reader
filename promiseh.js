/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/
var promiseh = {
  
    //From an array of values and a function returning a promise from a value
    //Execute promises sequentially (Promise.all doesn't run sequentially)
    consecutive: function(values, fPromise) {
        return values.reduce((p, value) => {
            return p.then(() => {
                return fPromise(value);
            }).catch(error => {
                console.log(error);
            });
        }, Promise.resolve());
    },

    wait(data) {
        return new Promise((resolve, reject) => {
            let waitTimer = Math.round(Math.random()*18000)+15000;
            console.log(waitTimer);
            setTimeout(function () {
                resolve(data);
            }, waitTimer);
        });
    }

  };

  module.exports = promiseh;
