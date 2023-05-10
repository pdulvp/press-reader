import { api } from "../api.mjs"
import { dateh } from "../dateh.mjs"

class BooksList extends HTMLElement {
  connectedCallback() {
    api.list().then(e => {

      let selectedGroup = this.getAttribute("group");

      let groups = {};
      e.forEach(a => {
          if (groups[a.group] == undefined) groups[a.group] = 0;
          groups[a.group]++;
      });

      if (selectedGroup != undefined) {
        let result = e.filter(a => selectedGroup == undefined || a.group == selectedGroup).map(a => {
            return `<li><book-link code="${a.code}" status="${a.latest.status}" current="${a.latest.current}" total="${a.latest.total}" date="${a.latest.date}" name="${a.name}" readableDate="${dateh.toReadable(a.latest.date)}"></book-link></li>`;
        }).join("");

        let ul = `<ul class="books">`+result+`</ul>`;
        this.shadowRoot.querySelector(".list").innerHTML = ul;
      }
      
      let result2 = Object.keys(groups).map(k => {
        let deg = ((k.charCodeAt(0) * 8+k.charCodeAt(1) * 1 + 20)) % 360;
        return `<li group="${k}" ${selectedGroup == k ? "selected=true" : ""}  style="filter: hue-rotate(${deg}deg);" class="button">${k}</li>`;
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
          background-color: lightblue;
          border-radius: 5px;
          flex-basis: 150px; 
          flex-grow: 0; 
          flex-shrink: 0;
          border: 2px solid lightgray;
        }
        .button[selected] {
          border: 2px solid rgb(100,50,50);
        }
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
