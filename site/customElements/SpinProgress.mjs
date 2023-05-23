/* 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-sa/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-SA-4.0
 @author: pdulvp@laposte.net

 --spin-color           default black
 --spin-width           default 40
 --spin-stroke-width    default 4
 */
import { getPercent } from './SpinProgress.domain.mjs';

class SpinProgress extends HTMLElement {

  connectedCallback() {
    let svg = this.shadowRoot.querySelector("svg");
    let back = this.shadowRoot.querySelector(".back");
    let bar = this.shadowRoot.querySelector(".bar");
    let text = this.shadowRoot.querySelector(".text");

    const style = getComputedStyle(svg);
    let color = style.getPropertyValue("--spin-color") ? "var(--spin-color)" : "black";
    let stroke = style.getPropertyValue("--spin-stroke-width") ? parseInt(style.getPropertyValue("--spin-stroke-width")) : "4";
    let width = style.getPropertyValue("--spin-width") ? parseInt(style.getPropertyValue("--spin-width")) : "40";

    let percent = parseInt(this.getAttribute("percent"));
    let textContent = this.getAttribute("text");
    var percents = getPercent(width, stroke, percent);
    text.textContent = textContent ? textContent : percent;

    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${width}`);
    svg.setAttribute("viewport", `0 0 ${width} ${width}`);

    back.setAttribute("stroke", "#EEEEEE");
    back.setAttribute("stroke-width", `${stroke}`);
    back.setAttribute("r", `${percents.rayon}`);
    back.setAttribute("cx", `${width / 2}`);
    back.setAttribute("cy", `${width / 2}`);

    bar.setAttribute("stroke", color);
    bar.setAttribute("stroke-width", `${stroke}`);
    bar.setAttribute("r", `${percents.rayon}`);
    bar.setAttribute("cx", `${width / 2}`);
    bar.setAttribute("cy", `${width / 2}`);

    bar.setAttribute("transform", `rotate(270 ${width / 2} ${width / 2})`);
    bar.setAttribute("stroke-dasharray", `${percents.length}`);
    bar.setAttribute("stroke-dashoffset", `${percents.current}`);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
  }

  static get observedAttributes() { return ['percent']; }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        svg {
          all: initial;
        }
        .text {
          user-select: none; font-family: Courier; font-size: 12px; font-weight: bold;
        }
      </style>
      <svg class="svg" version="1.1">
        <circle class="back" fill="transparent" stroke-dashoffset="0"></circle>
        <circle class="bar" fill="transparent" stroke-dashoffset="0" ></circle>
        <text class="text" x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"></text>
      </svg>`
  }
}
customElements.define('spin-progress', SpinProgress);
