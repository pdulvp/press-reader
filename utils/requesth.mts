import http from 'node:http'

var requesth = {
  body(request: http.IncomingMessage) {
    return new Promise(function (resolve: (body: string) => void, reject) {
      let body: Buffer[] = [];
      request.on('error', (err) => {
        reject(err);
      }).on('data', (chunk: Buffer) => {
        body.push(chunk);
      }).on('end', () => {
        resolve(Buffer.concat(body).toString());
      });
    });
  },
  json(request: http.IncomingMessage) {
    return requesth.body(request).then(body => Promise.resolve(JSON.parse(body)));
  }
};

export { 
  requesth
}
