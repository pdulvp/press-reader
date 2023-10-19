var promiseh = require("./promiseh");

function create(i) {
  return new Promise((resolve, reject) => {
    console.log(i);
    resolve(i);
    promiseh.queue.append([() => create(i + " _1"), () => create(i + " _2")]);
  }).then(promiseh.wait);
}

promiseh.queue.append(() => create(0));
promiseh.queue.append([() => create(1), () => create(2)]);
promiseh.queue.append(() => create(3));
promiseh.queue.append(() => create(4));
promiseh.queue.append(() => create(5));
