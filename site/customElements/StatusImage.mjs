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
        .img-root {  
          display: grid;
          overflow: hidden;
        }
        /*.img {
          z-index: 10;
          grid-area: 1 / 1;
          background-color: rgba(50,50,50,0.1);
          font-family: Courier New;
          transform: translate(-2.1rem, 2ex) rotate(-15deg);
          font-size: 24px;
          height: 75;
          width: 140%;
          font-weight: bold;
        }*/
        img {
          grid-area: 1 / 1;
        }
        </style>
        <div class="img-root"><img></img><div class="img"></div></div>`
  }
}
customElements.define('img-status', StatusImage);
