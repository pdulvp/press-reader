
var urlh = {
  check: (url, rules) => {
    let result = Object.keys(rules).map(k => {
      let value = url.searchParams.get(k);
      return rules[k](value);
    });
    return result;
  },
  params: (url, rules) => {
    let result = urlh.check(url, rules);
    if (result.find(r => !r.status)) {
      throw new Error('Wrong parameters: ' + result.filter(c => !c.status).map(c => c.msg).join(","));
    }
    result = {};
    Object.keys(rules).forEach(k => result[k] = url.searchParams.get(k));
    return result;
  }
};

module.exports = urlh;
