import { api } from "../api.mjs"

class BooksList extends HTMLElement {
  connectedCallback() {
    api.list().then(e => {
      let groups = {};
      e.forEach(a => {
          if (groups[a.group] == undefined) groups[a.group] = 0;
          groups[a.group]++;
      });

      let selectedGroup = this.getAttribute("group");
      if (selectedGroup != undefined) {
        let result = e.filter(a => selectedGroup == undefined || a.group == selectedGroup).map(a => {
          return `<li><book-link code="${a.code}" date="${a.latest.date}" name="${a.name}"></book-link></li>`;
        }).join("");

        let ul = `<ul class="books">`+result+`</ul>`;
        this.shadowRoot.querySelector(".list").innerHTML = ul;
      }
        
      let i=0;
      let result2 = Object.keys(groups).map(k => {
        return `<li group="${k}" ${selectedGroup == k ? "selected=true" : ""} class="button button-${i++}" >${k}</li>`;
      }).join("");
      let ul2 = `<ul class="groups">`+result2+`</ul>`;
      this.shadowRoot.querySelector(".groups").innerHTML = ul2;

      let dnd = this;
      this.shadowRoot.querySelectorAll(".button").forEach(b => {
        b.onclick = (event) => {
          dnd.setAttribute("group", event.target.getAttribute("group"));
        }
      });
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.connectedCallback();
  }

  static get observedAttributes() { return ['group']; }

  constructor(){
    super();
      const shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = `
      <style>
        .button {
          padding: 10px;
          border-radius: 5px;
          flex-basis: 150px; 
          flex-grow: 0; 
          flex-shrink: 0;
          font-family: Segoe UI;
          color: white;
          font-weight: bold;
          border: 2px solid lightgray;
        }
        .button[selected] {
          border: 2px solid rgb(100,50,50);
        }

        .button-0 { background-color: #59AAC7; }
        .button-1 { background-color: #BE72AD; }
        .button-2 { background-color: #849A7B; }
        .button-3 { background-color: #545E7E; }
        .button-4 { background-color: #EF9A9A; }
        .button-5 { background-color: #CDC598; }
        .button-6 { background-color: #F3D482; }
        .button-7 { background-color: #88C9C3; }
        .button-8 { background-color: #6A596A; }
        .button-9 { background-color: #CBC75D; }
        .button-10 { background-color: #8690E4; }
        .button-11 { background-color: #83B594; }
        .button-12 { background-color: #A46161; }
        .button-13 { background-color: #DC5F2F; }
        .button-14 { background-color: #B7694C; }
        .button-15 { background-color: #932800; }

        .books {
          margin-left: 60px; 
          margin-right: 60px; 
          list-style-type: none; 
          display: flex; 
          flex-direction: row; 
          gap: 30px; 
          flex-wrap: wrap;
        }
        .groups {
          justify-content: center; 
          list-style-type: none; 
          display: flex; 
          flex-direction: row; 
          gap: 10px; 
          flex-wrap: wrap;
        }
      </style>
      <div class="main">
        <div class="groups"></div>
        <div class="list"></div>
      </div>
      `;
    }
  }
  
  // Define the new element
  customElements.define('books-list', BooksList);
