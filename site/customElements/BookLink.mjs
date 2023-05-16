import { api } from "../api.mjs"
import { dateh } from "../dateh.mjs"

class BookLink extends HTMLElement {
    
  connectedCallback() {
    
    let code = this.getAttribute('code');
    let date = this.getAttribute('date');

    let img = this.shadowRoot.querySelector("img-status");
    api.fetch.thumb(code, date).then(data => {
      img.src = data.thumbnail;
      img.disabled = data.status == "cover";
    });

    img.onclick = function(e) {
      document.getElementById("book-side-panel").setAttribute("code", code);
      document.getElementById("book-side-panel").setAttribute("date", date);

      document.getElementById("book-side-panel").open = true;
      document.getElementById("background-panel").open = true;
    }
    
    this.shadowRoot.querySelectorAll("a")[0].href = `/read?code=${this.getAttribute('code')}&date=${this.getAttribute('date')}`;
    this.shadowRoot.querySelectorAll("a")[0].textContent = this.getAttribute('name');
    this.shadowRoot.querySelectorAll("span")[1].textContent = dateh.toReadable(this.getAttribute('date'));

  }

  constructor(){
    super();
      
      const shadow = this.attachShadow({mode: 'open'});
      
      const wrapper = document.createElement('div');
      wrapper.setAttribute('style', 'width: 150px');
      
      wrapper.innerHTML = `<img-status width="150px" height="200px"></img-status>
      <span style="padding: 4px; display:block; font-family: Segoe UI">
          <a style="font-size: 14px; color: #222; text-decoration: none"></a>
          <br/>
          <span style="font-size: 12px; color: gray"></span>
          <br/>
          <span style="font-size: 12px; color: gray"></span>
      </span>
      `;

      const style = document.createElement('style');
      style.textContent = ``;
      
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
    }
  }
  
  // Define the new element
  customElements.define('book-link', BookLink);
