

import assert from 'assert';
import { getPercent } from './SpinProgress.domain.mjs';

function check(width, percent) {
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;
  let result = getPercent(width, 0, percent);
  let expected = parseInt((100 - percent) / 100 * result.length);
  console.log(`current: ${result.current}, expected: ${expected}`)
  assert(result.current == expected);
}

check(40, 25);
check(40, 40);
check(40, 80);
check(40, 100);
check(40, -10);
check(40, 110);