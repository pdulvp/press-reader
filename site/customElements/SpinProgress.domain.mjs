/* 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-sa/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-SA-4.0
 @author: pdulvp@laposte.net
 */
export function getPercent(width, stroke, percent) {
  let circleWidth = width - stroke;
  percent = isNaN(percent) ? 100 : Math.max(0, Math.min(100, percent));
  var c = parseInt(Math.PI * circleWidth);
  var pct = parseInt(((100 - percent) / 100) * c);
  return { rayon: (circleWidth) / 2, length: c, current: pct }
}
