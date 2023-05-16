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

    swait(data) {
        return new Promise((resolve, reject) => {
            let waitTimer = Math.round(Math.random()*1800)+1500;
            console.log(waitTimer);
            setTimeout(function () {
                resolve(data);
            }, waitTimer);
        });
    },

    wait(data) {
        return new Promise((resolve, reject) => {
            let waitTimer = Math.round(Math.random()*18000)+15000;
            console.log(waitTimer);
            setTimeout(function () {
                resolve(data);
            }, waitTimer);
        });
    },

    queue: {
        pendingPromises: [],
        isExecuted: false,
        append: function(fPromise) {
            console.log("append");
            if (Array.isArray(fPromise)) {
                fPromise.forEach(p => this.pendingPromises.push(p));
            } else  {
    	        this.pendingPromises.push(fPromise);
            }
            if (!this.isExecuted) {
                this.proceedPending();
            }
        },
        proceedPending: function() {
            return new Promise((resolve, reject) => {
                console.log("proceedPending");
                let current = this.pendingPromises.shift();
                if (current) {
                    this.isExecuted = true;
                    current().then(e => {
                        if (this.pendingPromises.length > 0) {
                            return promiseh.wait().then(e => {
                                return this.proceedPending();
                            });
                        } else {
                            this.isExecuted = false;
                            console.log("queue is finishing");
                            resolve(e);
                        }
                    });
                } else {
                    console.log("queue is empty");
                }
            });
        }
    }
  };

  module.exports = promiseh;
