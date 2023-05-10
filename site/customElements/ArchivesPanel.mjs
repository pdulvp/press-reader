import { api } from "../api.mjs"

class ArchivesPanel extends HTMLElement {
    
  archives = [];
  connectedCallback() {
    let element = this.shadowRoot.querySelector("ul");
    let result = this.archives.map(d => {
      return `
      <li>
        <img width="120px" code="${d.code}" date="${d.date}" status="${d.status}" current="${d.current}" total="${d.total}" src="/thumb?code=${d.code}&date=${d.date}"></img>
        <span>${d.date}</span>
      </li>`;
    }).join("");
    if (this.archives.length == 0) {
      result = "No archives found";
    }
    element.innerHTML = result;
    let imgs = this.shadowRoot.querySelectorAll("img");
    imgs.forEach(img => {
      let status = img.getAttribute("status");
      img.style = "border: 1px solid gray; " + (status == "empty" ? "filter:saturate(-0)": "");
      img.onclick = function(event) {

        document.getElementById("book-side-panel").setAttribute("code", event.target.getAttribute("code"));
        document.getElementById("book-side-panel").setAttribute("date", event.target.getAttribute("date"));
        document.getElementById("book-side-panel").setAttribute("current", event.target.getAttribute("current"));
        document.getElementById("book-side-panel").setAttribute("total", event.target.getAttribute("total"));
        document.getElementById("book-side-panel").setAttribute("status", event.target.getAttribute("status"));
        document.getElementById("book-side-panel").open = false;
        document.getElementById("background-panel").open = false;
        document.getElementById("book-side-panel").open = true;
        document.getElementById("background-panel").open = true;
      }
    });
  }

  stop = function(event) {
    
  }
  onOpen = function() {
    let element = this.shadowRoot.querySelector("ul");
    element.innerHTML = "Loading archives. Please wait";
    let dwn = this;
    let code = document.getElementById("book-side-panel").getAttribute("code");
    let date = document.getElementById("book-side-panel").getAttribute("date");
    api.archives(code, date).then(d => {
      dwn.archives = d.slice(0, 10);
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
        div {
          background-color: #dfd1001f;
          padding: 20px;
          color: rgb(100,50,50);
          font-family: Segoe UI;
        }
        img {
          
        }
        ul {
          margin-top: 10px;
          padding: 0px;
          display: flex;
          flex-direction: row;
          list-style-type: none;
          gap: 10px;
          flex-wrap: wrap;
        }
        li {
          padding: 0px;
          display: flex;
          flex-direction: column;
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
      <span class="title">Archives</span>
      <ul class="ul">
      </ul>
      </div>
      `;
    }
  }
  
  // Define the new element
  customElements.define('archives-panel', ArchivesPanel);
