class BookLink extends HTMLElement {
    
  connectedCallback() {
    let status = this.getAttribute('status');
    let code = this.getAttribute('code');
    let date = this.getAttribute('date');

    let current = this.getAttribute('current');
    let total = this.getAttribute('total');
    
    let links = [];
    if (status != "empty") links.push(`<a href="/readCurrent?code=${code}&date=${date}">read</a>`);
    if (status != "complete") links.push(`<a href="/downloadCurrent?code=${code}&date=${date}">download</a> (<a href="/downloadCurrent?code=${code}&date=${date}&type=full">full</a>)`);
    if (status == "in progress") links.push(`<a href="/stopDownload?code=${code}&date=${date}">stop</a>`);
    
    if (current != "undefined" && total != "undefined" ) {
      let percent = parseInt((parseInt(current) / parseInt(total)) * 100);
      links.push(`<spin-progress class="spin-warn" text="${current}" percent="${percent}"></spin-progress>`);
    }
    if (status == "complete") {
      links.push(`<spin-progress class="spin-warn" text="✔" percent="100"></spin-progress>`);
    }

    let img = this.shadowRoot.querySelector("img");
    img.src = `/thumb?code=${code}&date=${date}`;
    img.style = "border: 1px solid gray; " + (status == "empty" ? "filter:saturate(-0)": "");
    if (status == "empty") {
      img.onclick = function(e) {
        fetch(`/downloadCurrent?code=${code}&date=${date}&type=cover`).then(e => {
          setTimeout(() => {
            img.src = `/thumb?code=${code}&date=${date}&time=` + new Date().getTime();
            img.style = "border: 1px solid gray;";
          }, 10000);
        });
      }
    }
    this.shadowRoot.querySelectorAll("a")[0].href = `/read?code=${this.getAttribute('code')}&date=${this.getAttribute('date')}`;
    this.shadowRoot.querySelectorAll("a")[0].textContent = this.getAttribute('name');
    this.shadowRoot.querySelectorAll("span")[1].textContent = this.getAttribute('readableDate');
    this.shadowRoot.querySelectorAll("span")[2].innerHTML = links.join(" - ");
  }

  constructor(){
    super();
      const clickHandler = function(event) {
        console.log('event target', event.target)
      }
      
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
