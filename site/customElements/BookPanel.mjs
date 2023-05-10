import { api } from "../api.mjs"

class BookPanel extends HTMLElement {
    
  connectedCallback() {
    let img = this.shadowRoot.querySelector("img");
    let code = document.getElementById("book-side-panel").getAttribute("code");
    let date = document.getElementById("book-side-panel").getAttribute("date");
    let status = document.getElementById("book-side-panel").getAttribute("status");
    let current = document.getElementById("book-side-panel").getAttribute("current");
    let total = document.getElementById("book-side-panel").getAttribute("total");
    img.src = `/thumb?code=${code}&date=${date}`;
    img.style = "border: 1px solid gray; " + (status == "empty" ? "filter:saturate(-0)": "");
    img.onclick = function(e) {
      if (status == "empty") {
        fetch(`/api/download?code=${code}&date=${date}&type=cover`).then(e => {
          setTimeout(() => {
            img.src = `/thumb?code=${code}&date=${date}&time=` + new Date().getTime();
            img.style = "border: 1px solid gray;";
          }, 10000);
        });
      }
    }

    let date2 = this.shadowRoot.querySelector(".date");
    let links2 = this.shadowRoot.querySelector(".links");
    date2.textContent = date;

    let links = [];
    if (status != "empty") links.push(`<a href="/readCurrent?code=${code}&date=${date}">read</a>`);
    if (status != "complete") links.push(`<a class="download">download</a> (<a class="download-full">full</a>)`);
    
    if (current != "undefined" && total != "undefined" ) {
      let percent = parseInt((parseInt(current) / parseInt(total)) * 100);
      links.push(`<spin-progress class="spin-warn" text="${current}" percent="${percent}"></spin-progress>`);
    }
    if (status == "complete") {
      links.push(`<spin-progress class="spin-warn" text="✔" percent="100"></spin-progress>`);
    }
    links2.innerHTML = links.join(" - ");
    
    let download = this.shadowRoot.querySelector("a.download");
    download.onclick = function(e) {
      fetch(`/api/download?code=${code}&date=${date}`).then(e => {
        console.log(e);
      });
      //href="/api/download?code=${code}&date=${date}"
    }

    let downloadFull = this.shadowRoot.querySelector("a.download-full");
    downloadFull.onclick = function(e) {
      fetch(`/api/download?code=${code}&date=${date}&type=full`).then(e => {
        console.log(e);
      });
      //href="/api/download?code=${code}&date=${date}"
    }

  }

  onOpen = function() {
    this.connectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue != null) this.connectedCallback();
  }

  static get observedAttributes() { return ['code', 'date', 'status', 'current', 'total']; }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        span.title {
          text-transform: uppercase;
          font-weight: bold;
        }
        div.main {
          margin: 20px;
          color: rgb(100,50,50);
          font-family: Segoe UI;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        img {
          flex-grow: 0;
          border: 1px solid lightgray;
        }
      </style>
      <div class="main">
        <img width="220px"></img>
        <span class="date"></span>
        <div class="links"></div>
      </div>
      `;
    }
  }
  
  // Define the new element
  customElements.define('book-panel', BookPanel);
