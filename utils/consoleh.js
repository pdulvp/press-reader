var consoleh = {
  green(msg) {
    console.log('\u001b[' + 32 + 'm' + msg + '\u001b[0m');
  },
  red(msg) {
    console.log('\u001b[' + 31 + 'm' + msg + '\u001b[0m');
  },
  yellow(msg) {
    console.log('\u001b[' + 33 + 'm' + msg + '\u001b[0m');
  },
  blue(msg) {
    console.log('\u001b[' + 34 + 'm' + msg + '\u001b[0m');
  }
}

module.exports = consoleh;