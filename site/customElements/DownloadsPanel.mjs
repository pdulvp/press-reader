import { api } from "../api.mjs"

class DownloadsPanel extends HTMLElement {
    
  downloads = [];
  connectedCallback() {
    let element = this.shadowRoot.querySelector("ul");
    let result = this.downloads.map(d => {
      let percent = parseInt((parseInt(d.current) / parseInt(d.total)) * 100);
      return `
      <li>
        <spin-progress class="spin-warn" text="${d.current}" percent="${percent}"></spin-progress>
        <span class="${d.inProgress?"":"stopped"}">${d.code} ${d.inProgress ? "(in progress)" : ""}</span>
        ${d.inProgress ? `<a href="/api/stop?code=${d.code}&date=${d.date}">stop</a>` : ``}
      </li>`;
    }).join("");
    if (this.downloads.length == 0) {
      result = "No download yet";
    }
    element.innerHTML = result;
    let stop = this.shadowRoot.querySelector("a");
    stop.onclick = stop();
  }

  stop = function(event) {
    
  }
  onOpen = function() {
    let dwn = this;
    api.downloads().then(d => {
      dwn.downloads = d.reverse().slice(0, 10);
      dwn.connectedCallback();
    });
  }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        span.title {
          text-transform: uppercase;
          font-weight: bold;
        }
        span.stopped {
          text-decoration: line-through;
          color: gray;
        }
        div {
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
          gap: 10px;
        }
        li {
          padding: 0px;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
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
      <div>
      <span class="title">Downloads</span>
      <ul class="ul">
      </ul>
      </div>
      `;
    }
  }
  
  // Define the new element
  customElements.define('downloads-panel', DownloadsPanel);
