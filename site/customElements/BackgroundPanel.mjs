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
import { domh } from "../domh.mjs"

class BackgroundPanel extends HTMLElement {
  
  get open() {
    let element = this.shadowRoot.querySelector("div");
    return !domh.hasClass(element, 'back-invisible')
  }
  
  set open(val) {
    let element = this.shadowRoot.querySelector("div");
    if(val) {
      domh.removeClass(element, 'back-invisible');
    } else {
      domh.addClass(element, 'back-invisible');
    }
  }

  connectedCallback() {
    let element = this.shadowRoot.querySelector("div");
    element.onclick = (e) => {
      this.getAttribute("close").split(" ").forEach(element => {
        let item = document.getElementById(element);
        if (item.open) {
          item.open = false;
        }
      });
      this.open = false;
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
  }

  static get observedAttributes() { return ['close']; }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        .nav-side-background.back-invisible {
          display: none;
        }
        .nav-side-background { 
            background-color: rgba(31, 6, 46, 0.514);
            width: 100%;
            height: 100%;
            top: 48px;
            position: fixed;
            z-index: 99; 
        }
      </style>
      <div id="nav-side-background" class="nav-side-background back-invisible"></div>`
  }
}
customElements.define('background-panel', BackgroundPanel);
