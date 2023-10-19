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

class NavHeader extends HTMLElement {

  connectedCallback() {

  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
    if (name == "expand") {
      let button = this.shadowRoot.querySelector(".button");
      button.onclick = (e) => {
        this.getAttribute("close").split(" ").forEach(element => {
          let item = document.getElementById(element);
          if (item.open) {
            item.open = false;
          }
        });
        newValue.split(" ").forEach(element => {
          let doc = document.getElementById(element);
          doc.open = !doc.open;
        });
      };
    }
  }

  static get observedAttributes() { return ['expand']; }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        nav.header {
          position: sticky;
          top: 0px;
          z-index: 100;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 20px;
          border-bottom: 1px solid lightgray;
          background-color: white;
          color: rgb(100,50,50);
        }
        .button {
          margin: 10px;
          flex-basis: 40px;
          text-align: center;
        }
        ::slotted(a) {
          margin: 10px;
        }
        @media(max-width: 900px) { 
          ::slotted(a) {
          }
        }

        ul {
          list-style-type: none;
        }
        li:first-child {
          list-style-type: none;
          margin-top: 6px;
        }
        ul::before {
           content:attr(title);
        }
        .button::before {
          content: "#";
          font-family: Courier New;
          font-size: 24px;
          font-weight: bold;
        }
      </style>
      <nav class="header">
        <div class="button"></div>
        <slot name="content"></slot>
      </nav>`
  }
}
customElements.define('nav-header', NavHeader);
