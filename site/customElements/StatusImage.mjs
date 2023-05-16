function hasClass(item, value) {
	return item.getAttribute("class") != null && (item.getAttribute("class").includes(value));
}

function removeClass(item, value) {
	if (hasClass(item, value)) {
		item.setAttribute("class", item.getAttribute("class").replace(value, "").trim());
	}
} 

function addClass(item, value) {
	if (item == undefined || item == null) {
		console.warn("Unknown item");
	} else {
		if (!hasClass(item, value)) {
			let current = item.getAttribute("class");
			current = current == null ? "" : current;
			item.setAttribute("class", (current+ " "+value+" ").trim());
		}
	}
}

class StatusImage extends HTMLElement {
    get disabled() {
      let element = this.shadowRoot.querySelector("img");
      return hasClass(element, 'disabled')
    }
    
    set disabled(val) {
      if(val) {
        let element = this.shadowRoot.querySelector("img");
        addClass(element, 'disabled');
      } else {
        let element = this.shadowRoot.querySelector("img");
        removeClass(element, 'disabled');
      }
    }
  
    get src() {
      let element = this.shadowRoot.querySelector("img");
      return element.src;
    }
    
    set src(val) {
      let element = this.shadowRoot.querySelector("img");
      element.src = val;
    }

    connectedCallback() {
      
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue != null) this.connectedCallback();
      if (name == "class") {
        removeClass(this.shadowRoot.querySelector("img"), oldValue);
        addClass(this.shadowRoot.querySelector("img"), newValue);
      } else {
        this.shadowRoot.querySelector("img").setAttribute(name, newValue);
      }
     }
  
    static get observedAttributes() { return ['class', 'style', 'width', 'height']; }
  
    constructor(){
      super();
        const shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = `
        <style>
        .disabled {
          filter: saturate(-0);
        }
        </style>
        <img></img>`
    }
  }
  customElements.define('img-status', StatusImage);
  