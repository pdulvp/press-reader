import { api } from "../api.mjs"
import { dateh } from "../dateh.mjs"

class BookLink extends HTMLElement {

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        .root {
          width: 150px
        }
        .abstract {
          font-size: 12px; color: gray
        }
        .title {
          font-size: 14px; color: #222; text-decoration: none
        }
        .img {
          display: block;
          border: 1px solid gray;
        }
        .description-section {
          padding: 4px; display:flex; font-family: Segoe UI;
          flex-direction: column;
        }
      </style>
      <div class="root">
        <img-status class="img" width="148px" height="200px"></img-status>
        <div class="description-section">
            <a class="title"></a>
            <span class="abstract"></span>
        </div>
      </div>
      `;
  }

  connectedCallback() {

    let code = this.getAttribute('code');
    let date = this.getAttribute('date');

    let img = this.shadowRoot.querySelector("img-status");
    api.fetch.thumb(code, date).then(data => {
      img.src = data.thumbnail;
      img.disabled = data.status == "cover";
    });

    img.onclick = function (e) {
      document.getElementById("book-side-panel").setAttribute("code", code);
      document.getElementById("book-side-panel").setAttribute("date", date);

      document.getElementById("book-side-panel").open = true;
      document.getElementById("background-panel").open = true;
    }

    this.shadowRoot.querySelector("a").href = `/read?code=${this.getAttribute('code')}&date=${this.getAttribute('date')}`;
    this.shadowRoot.querySelector("a").textContent = this.getAttribute('name');
    this.shadowRoot.querySelector("span").textContent = dateh.toReadable(this.getAttribute('date'));

  }
}

// Define the new element
customElements.define('book-link', BookLink);
