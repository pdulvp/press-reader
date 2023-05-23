/** 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
*/

var consoleh = require("./consoleh");

var promiseh = {

  //From an array of values and a function returning a promise from a value
  //Execute promises sequentially (Promise.all doesn't run sequentially)
  consecutive: function (values, fPromise) {
    return values.reduce((p, value) => {
      return p.then(() => {
        return fPromise(value);
      }).catch(error => {
        console.log(error);
      });
    }, Promise.resolve());
  },

  wait(data, duration = undefined) { //let waitTimer = Math.round(Math.random()*18000)+15000;
    return new Promise((resolve, reject) => {
      let waitTimer = duration ? duration : Math.round(Math.random() * 18000) + 15000;
      console.log(waitTimer);
      setTimeout(function () {
        resolve(data);
      }, waitTimer);
    });
  },

  newQueue: (duration = () => 0) => {
    return {
      pendingPromises: [],
      isExecuted: false,

      push: function (fPromise, first = false) {
        let toAdd = Array.isArray(fPromise) ? fPromise : [fPromise];
        if (first) {
          console.log("push first");
          this.pendingPromises.unshift(...toAdd);
        } else {
          console.log("push");
          this.pendingPromises.push(...toAdd);
        }

        if (!this.isExecuted) {
          this.proceedPending();
        }
      },
      proceedPending: function () {
        consoleh.green("queue: " + this.pendingPromises.length);

        return new Promise((resolve, reject) => {
          console.log("proceedPending");
          let current = this.pendingPromises.shift();
          if (current) {
            this.isExecuted = true;
            current().then(e => {
              if (this.pendingPromises.length > 0) {
                return promiseh.wait(null, duration()).then(e => {
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
  }
};

module.exports = promiseh;
