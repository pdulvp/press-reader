import { api } from "./api.mjs"
import { dateh } from "./dateh.mjs"

console.log(document.location);
console.log(document);
console.log(window);

export function toto(event){
    alert(event);
}
if (document.location.pathname == "/") {
    api.list().then(e => {
        let result = e.map(a => {
            return `<li><book-link code="${a.code}" status="${a.status.status}" current="${a.status.current}" total="${a.status.total}" date="${a.date}" name="${a.name}" readableDate="${dateh.toReadable(a.date)}"></book-link></li>`;
        }).join("");
        let ul = `<ul style="margin-left: 60px; margin-right: 60px; list-style-type: none; display: flex; flex-direction: row; gap: 30px; flex-wrap: wrap;">`+result+`</ul>`;
        document.getElementById("content").innerHTML = ul;
    });

}
