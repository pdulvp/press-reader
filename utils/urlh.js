
var urlh = {
    check: (url, rules) => { 
          let result = Object.keys(rules).map(k => {
            let value = url.searchParams.get(k);
            return rules[k](value);
          });
          return result;
    }
  };

module.exports = urlh;
