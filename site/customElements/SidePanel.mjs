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

function hasClass(item, value) {
	return item.getAttribute("class") != null && (item.getAttribute("class").includes(value));
}

function removeClass(item, value) {
	if (hasClass(item, value)) {
		item.setAttribute("class", item.getAttribute("class").replace(value, "").trim());
	}
} 

function addClass(item, value) {
	if (item == undefined || item == null) {
		console.warn("Unknown item");
	} else {
		if (!hasClass(item, value)) {
			let current = item.getAttribute("class");
			current = current == null ? "" : current;
			item.setAttribute("class", (current+ " "+value+" ").trim());
		}
	}
}


class SidePanel extends HTMLElement {
  get open() {
    let element = this.shadowRoot.querySelector("nav");
    return hasClass(element, 'slide-in')
  }
  
  set open(val) {
    if(val) {
      let element = this.shadowRoot.querySelector("nav");
      addClass(element, 'slide-in');
      removeClass(element, 'slide-out');
      this.shadowRoot.querySelector("slot").assignedElements().forEach(e => {
        if (e.onOpen) e.onOpen(null)
      });
    } else {
      let element = this.shadowRoot.querySelector("nav");
      removeClass(element, 'slide-in');
      addClass(element, 'slide-out');
      this.shadowRoot.querySelector("slot").assignedElements().forEach(e => {
        if (e.onClose) e.onClose(null);
      });
    }
  }

  connectedCallback() {
    
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
    if (name == "class") {
      removeClass(this.shadowRoot.querySelector("nav"), oldValue);
      addClass(this.shadowRoot.querySelector("nav"), newValue);
    }
   }

  static get observedAttributes() { return ['class']; }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        .slide-in {
          animation: slide-in 0.2s forwards;
          -webkit-animation: slide-in 0.2s forwards;
        }
        .slide-out {
            animation: slide-out 0.2s forwards;
            -webkit-animation: slide-out 0.2s forwards;
        }
        @keyframes slide-in {
            100% { transform: translateX(0%); }
        }
        @keyframes slide-out {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-100%); }
        }

        nav.leftSide {
          flex-direction: column;
          position: fixed;
          z-index: 100;
          display: flex;
          background-color: white;
          border-right: 1px solid lightgray;

          flex-grow: 0;
          flex-shrink: 0;

          left: 0;
          top: 48px;
          min-width: 350px;
          max-width: 350px;
          bottom: 0px;
          overflow-y: auto;
          transform: translateX(-100%);
        }
      </style>
      <nav class="leftSide">
        <slot name="panel"></slot>
      </nav>`
  }
}
customElements.define('side-panel', SidePanel);
