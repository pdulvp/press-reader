var consoleh = {
  green(msg) {
    console.log('\u001b[' + 32 + 'm' + msg + '\u001b[0m');
  }
}

module.exports = consoleh;