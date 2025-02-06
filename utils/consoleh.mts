const consoleh =  {
  green(msg: string): void {
    console.log('\u001b[' + 32 + 'm' + msg + '\u001b[0m');
  },
  red(msg: string): void {
    console.log('\u001b[' + 31 + 'm' + msg + '\u001b[0m');
  },
  yellow(msg: string): void {
    console.log('\u001b[' + 33 + 'm' + msg + '\u001b[0m');
  },
  blue(msg: string): void {
    console.log('\u001b[' + 34 + 'm' + msg + '\u001b[0m');
  }
}

export {
  consoleh
}
