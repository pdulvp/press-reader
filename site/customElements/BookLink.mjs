class BookLink extends HTMLElement {
    
  connectedCallback() {
    const stopHandler = function(event) {
      console.log('event target', event.target)
    }
    
    const downloadHandler = function(event) {
      console.log('event target', event.target)
    }

    let status = this.getAttribute('status');
    let code = this.getAttribute('code');
    let date = this.getAttribute('date');

    let current = this.getAttribute('current');
    let total = this.getAttribute('total');
    
    let img = this.shadowRoot.querySelector("img");
    img.src = `/thumb?code=${code}&date=${date}`;
    img.style = "border: 1px solid gray; " + (status == "empty" ? "filter:saturate(-0)": "");
    img.onclick = function(e) {
      document.getElementById("book-side-panel").setAttribute("code", code);
      document.getElementById("book-side-panel").setAttribute("date", date);

      document.getElementById("book-side-panel").setAttribute("status", status);
      document.getElementById("book-side-panel").setAttribute("current", current);
      document.getElementById("book-side-panel").setAttribute("total", total);

      document.getElementById("book-side-panel").open = true;
      document.getElementById("background-panel").open = true;
    }
    
    this.shadowRoot.querySelectorAll("a")[0].href = `/read?code=${this.getAttribute('code')}&date=${this.getAttribute('date')}`;
    this.shadowRoot.querySelectorAll("a")[0].textContent = this.getAttribute('name');
    this.shadowRoot.querySelectorAll("span")[1].textContent = this.getAttribute('readableDate');
    this.shadowRoot.querySelectorAll("span")[2].innerHTML = links.join(" - ");

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

  constructor(){
    super();
      
      const shadow = this.attachShadow({mode: 'open'});
      
      const wrapper = document.createElement('div');
      wrapper.setAttribute('style', 'width: 150px');
      
      wrapper.innerHTML = `<img width="150px" height="200px" />
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
