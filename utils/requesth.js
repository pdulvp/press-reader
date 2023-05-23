
var requesth = {
  body(request) {
    return new Promise(function (resolve, reject) {
      let body = [];
      request.on('error', (err) => {
        reject(err);
      }).on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        resolve(body);
      });
    });
  },

  json(request) {
    return requesth.body(request).then(body => Promise.resolve(JSON.parse(body)));
  }
};

module.exports = requesth;
