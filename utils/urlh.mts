
type RuleResult = { status: boolean; msg: string }
type Rule = (type: string) => RuleResult

interface Rules {
  [key: string]: Rule;
}

type ParamValue = {
  variable: string;
  value: string
}

var urlh = {
  check: (url: URL, rules: Rules): RuleResult[] => {
    let result = Object.keys(rules).map(k => {
      let value = url.searchParams.get(k);
      return value == null ? { status: false, msg: `parameter ${k} is required` }: rules[k](value);
    });
    return result;
  },
  params: <T extends Rules>(url, rules: T): { [key in keyof T]: string } => {
    let result = urlh.check(url, rules);
    if (result.find(r => !r.status)) {
      throw new Error('Wrong parameters: ' + result.filter(c => !c.status).map(c => c.msg).join(","));
    }

    let result2 = Object.keys(rules).reduce((acc, key) => {
      acc[key] = url.searchParams.get(key);
      return acc;
    }, {});
    return result2 as { [key in keyof T]: string };
  }
};

export { type Rule, type RuleResult, type Rules, type ParamValue, urlh };
