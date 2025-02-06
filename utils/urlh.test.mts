
import { type Rule, type Rules, urlh } from './urlh.mts';
import { strict as assert, equal } from 'node:assert';

interface Rules22 extends Rules {
  code: Rule;
  date: Rule;
  type: Rule;
}
const Rules2: Rules22 = {
  code: (type) => {
    return { status: type != null && type.match(/^[a-zA-Z0-9_-]+$/) != null, msg: "code invalid format" }
  }, 
  date: (type) => {
      return { status: type != null && type.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) != null, msg: "date invalid format" }
  },
  type: (type) => {
      return {  status: type == "cover" || type == "full" || type == null, msg: "type invalid format" }
  }
};

let result = urlh.check(new URL("https://pdulvp.fr/?code=10&date=2021-01-02"), { code: (code) => { return { status: true, msg: "c" } }, date: (date) => { return { status: true, msg: "c" } } });
assert(result.filter(r => r.status).length == 2);

result = urlh.check(new URL("https://pdulvp.fr/?code=10&date=2021-01-02"), { code: (code) => { return { status: false, msg: "c" } }, date: (date) => { return { status: false, msg: "c" } } });
assert(result.filter(r => !r.status).length == 2);

result = urlh.check(new URL("https://pdulvp.fr/?code=10"), Rules2);
assert(result.filter(r => r.status).length == 1);

let res = urlh.params(new URL("https://pdulvp.fr/?date=2021-01-02"), { date: Rules2.date });
equal(res.date, "2021-01-02");
