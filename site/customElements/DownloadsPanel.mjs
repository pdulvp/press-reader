import { api } from "../api.mjs"
import { dateh } from "../dateh.mjs"

class DownloadsPanel extends HTMLElement {

  downloads = [];
  connectedCallback() {
    let element = this.shadowRoot.querySelector("ul");
    let result = this.downloads.map(d => {
      let percent = parseInt((parseInt(d.current) / parseInt(d.total)) * 100);
      return `
      <li>
        <div class="titleProgress" code="${d.code}" date="${d.date}" >
          <spin-progress class="spin-warn" text="${d.current}" percent="${percent}"></spin-progress>
          <div class="titleSection ${d.inProgress ? "" : "stopped"}">
            <span class="title">${d.name} ${d.inProgress ? "(in progress)" : ""}</span>
            <span class="abstract">${dateh.toReadable(d.date)}</span>
          </div>
        </div>
        <div class="actions"> 
        ${d.inProgress ? `<a href="/api/stop?code=${d.code}&date=${d.date}">stop</a>` : ``}
        </div>
      </li>`;
    }).join("");
    if (this.downloads.length == 0) {
      result = "No download yet";
    }
    element.innerHTML = result;
    let stop = this.shadowRoot.querySelector("a");
    if (stop) {
      stop.onclick = this.stopEvent;
    }

    let span = this.shadowRoot.querySelectorAll("div.titleProgress");
    if (span) {
      span.forEach(s => s.onclick = this.spanEvent);
    }
  }

  stopEvent = function (event) {

  }

  spanEvent = function (event) {
    let code = event.target.getAttribute("code");
    let date = event.target.getAttribute("date");

    document.getElementById("nav-side-panel").open = false;

    document.getElementById("book-side-panel").setAttribute("code", code);
    document.getElementById("book-side-panel").setAttribute("date", date);
    document.getElementById("book-side-panel").open = true;
  }

  onOpen = function () {
    api.fetch.downloads().then(d => {
      this.downloads = d.reverse().slice(0, 10);
      this.connectedCallback();
    });
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        div.titleSection {
          display: flex;
          flex-direction: column;
        }
        div.titleSection > span {
          flex-grow: 1;
        }
        span.root-title {
          font-weight: bold;
          text-transform: uppercase;
        }
        span.abstract {
          font-size: 12px; color: gray
        }
        div.stopped {
          text-decoration: line-through;
          color: gray;
        }
        div.root {
          margin: 20px;
          color: rgb(100,50,50);
          font-family: Segoe UI;
        }
        ul {
          margin-top: 10px;
          padding: 0px;
          display: flex;
          flex-direction: column;
          list-style-type: none;
          gap: 20px;
        }
        li {
          padding: 0px;
        }
        li div.titleProgress {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
        }
        li div.actions {
          display: flex;
          flex-direction: row-reverse;
        }
        li span {
          flex-grow: 1;
        }
        li spin-progress {
          flex-grow: 0;
        }
        li a {
          flex-grow: 0;
        }
      </style>
      <div class="root">
      <span class="root-title">Downloads</span>
      <ul class="ul">
      </ul>
      </div>
      `;
  }
}

// Define the new element
customElements.define('downloads-panel', DownloadsPanel);
