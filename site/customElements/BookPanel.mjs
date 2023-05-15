import { api } from "../api.mjs"

class BookPanel extends HTMLElement {
    
  status = undefined;

  connectedCallback() {
    let img = this.shadowRoot.querySelector("img");
    let code = document.getElementById("book-side-panel").getAttribute("code");
    let date = document.getElementById("book-side-panel").getAttribute("date");
    
    if (code != "null" && date != "null" && code != null && date != null) {
      api.thumb(code, date).then(data => {
        img.src = data.thumbnail;
        img.style = "border: 1px solid gray; " + (data.status == "cover" ? "filter:saturate(-0)": "");
        img.onclick = function(e) {
          if (data.status != "date") {
            fetch(`/api/download?code=${code}&date=${date}&type=cover`).then(e => {
              setTimeout(() => {
                img.src = `/thumb?code=${code}&date=${date}&time=` + new Date().getTime();
                img.style = "border: 1px solid gray;";
              }, 10000);
            });
          }
        }
      })
    }

    this.shadowRoot.querySelector(".date").textContent = date;

    if (this.status) {
      let links = [];
      if (this.status.status != "empty") links.push(`<a href="/readCurrent?code=${code}&date=${date}">read</a>`);
      if (this.status.status != "complete") links.push(`<a class="download">download</a> (<a class="download-full">full</a>)`);
      
      if (this.status.current != "undefined" && this.status.total != "undefined" ) {
        let percent = parseInt((parseInt(this.status.current) / parseInt(this.status.total)) * 100);
        links.push(`<spin-progress class="spin-warn" text="${this.status.current}" percent="${percent}"></spin-progress>`);
      }
      if (this.status.status == "complete") {
        links.push(`<spin-progress class="spin-warn" text="✔" percent="100"></spin-progress>`);
      }
      this.shadowRoot.querySelector(".links").innerHTML = links.join(" - ");
    }
    
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
    let dwn = this;
    let code = document.getElementById("book-side-panel").getAttribute("code");
    let date = document.getElementById("book-side-panel").getAttribute("date");
    api.status([{code: code, date: date}]).then(e => {
      dwn.connectedCallback();
    })
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
