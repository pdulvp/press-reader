class CloseBtn extends HTMLElement {
    constructor() {
      super();
  
      // Event listener
      const clickHandler = function(event) {
        console.log('event target', event.target)
      }
  
      // Create a shadow root 
      const shadow = this.attachShadow({mode: 'closed'});
  
      // Create elements 
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'btn-wrapper');
  
      const button = document.createElement('button');
      button.onclick = clickHandler; 
  
      const icon = `
        <svg width="34" height="34" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L7 7M13 13L7 7M7 7L13 1L1 13" stroke="red" stroke-width="2"/>
        </svg>`
  
      // Create CSS to apply to the shadow dom 
      const style = document.createElement('style');
      style.textContent = `
      .btn-wrapper {
        text-align: right;
      }
      .btn-wrapper button {
        background-color: transparent;
        padding: 0;
        border: none;
        cursor: pointer;
        outline:none;
      }
      .btn-wrapper button > * { 
        pointer-events: none;
      }`
      
      // Attach created elements to the shadow dom 
      shadow.appendChild(style);
      shadow.appendChild(wrapper);
      wrapper.appendChild(button);
      button.innerHTML += icon;
    }
  }
  
  // Define the new element
  customElements.define('close-btn', CloseBtn);
