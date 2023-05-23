import { domh } from "../domh.mjs"

class StatusImage extends HTMLElement {
  get disabled() {
    let element = this.shadowRoot.querySelector("img");
    return domh.hasClass(element, 'disabled')
  }

  set disabled(val) {
    if (val) {
      let element = this.shadowRoot.querySelector("img");
      domh.addClass(element, 'disabled');
    } else {
      let element = this.shadowRoot.querySelector("img");
      domh.removeClass(element, 'disabled');
    }
  }

  get src() {
    let element = this.shadowRoot.querySelector("img");
    return element.src;
  }

  set src(val) {
    let element = this.shadowRoot.querySelector("img");
    element.src = val;
  }

  connectedCallback() {

  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
    if (name == "width" || name == "height") {
      this.shadowRoot.querySelector("img").setAttribute(name, newValue);
    }
  }

  static get observedAttributes() { return ['width', 'height']; }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
        <style>
        .disabled {
          filter: saturate(-0);
        }
        </style><img></img>`
  }
}
customElements.define('img-status', StatusImage);
