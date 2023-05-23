var urlh = require("./urlh");
var assert = require("assert");

url = (obj) => {
  return { searchParams: { get: (code) => { return obj[code]; } } }
}

let result = urlh.check(url({ code: "10", date: "ok" }), { code: (code) => { return { status: true } }, date: (date) => { return { status: true } } });
assert(result.filter(r => r.status).length == 2);

result = urlh.check(url({ code: "10", date: "ok" }), { code: (code) => { return { status: false } }, date: (date) => { return { status: false } } });
assert(result.filter(r => !r.status).length == 2);
