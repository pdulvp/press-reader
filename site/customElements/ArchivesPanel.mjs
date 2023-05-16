import { api } from "../api.mjs"
import { dateh } from "../dateh.mjs"

class ArchivesPanel extends HTMLElement {
  
  archives = [];
  connectedCallback() {
    let element = this.shadowRoot.querySelector("ul");
    let result = this.archives.map(d => {
      let readable = dateh.toReadable(d.date);
      return `
      <li>
        <img-status width="120px" height="159px" code="${d.code}" date="${d.date}"></img-status>
        <span>${readable}</span>
      </li>`;
    }).join("");
    if (this.archives.length == 0) {
      result = "No archives found";
    }
    element.innerHTML = result;

    let title = this.shadowRoot.querySelector(".title");
    let dwn = this;
    title.onclick = function(event) {
      let element = dwn.shadowRoot.querySelector("ul");
      element.innerHTML = "Loading archives. Please wait";
      let code = document.getElementById("book-side-panel").getAttribute("code");
      let date = document.getElementById("book-side-panel").getAttribute("date");
      api.archives(code, date).then(d => {
        api.fetch.status(d).then(e => {
          dwn.archives = e.slice(0, 10);
          dwn.connectedCallback();
        })
      });
    }
    
    let imgs = this.shadowRoot.querySelectorAll("img-status");
    imgs.forEach(img => {
      let code = img.getAttribute("code");
      let date = img.getAttribute("date");
      api.fetch.thumb(code, date).then(data => {
        img.src = data.thumbnail;
        img.disabled = data.status == "cover";
      });

      img.onclick = function(event) {
        document.getElementById("book-side-panel").setAttribute("code", event.target.getAttribute("code"));
        document.getElementById("book-side-panel").setAttribute("date", event.target.getAttribute("date"));
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
    element.innerHTML = "Click title to load archives";
  }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        div.title {
          text-transform: uppercase;
          font-weight: bold;
        }
        div.root {
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
      <div class="root">
      <div class="title">Archives</div>
      <ul class="ul">
      </ul>
      </div>
      `;
    }
  }
  
  // Define the new element
  customElements.define('archives-panel', ArchivesPanel);
