import { api } from "./api.mjs"
import { dateh } from "./dateh.mjs"

console.log(document.location );
console.log(document);
console.log(window);

if (document.location.pathname == "/") {
    api.list().then(e => {
        let result = e.map(a => {
            return `<li><book-link code="${a.code}" status="${a.status.status}" current="${a.status.current}" total="${a.status.total}" date="${a.date}" name="${a.name}" readableDate="${dateh.toReadable(a.date)}"></book-link></li>`;
        }).join("");
        let ul = `<ul style="margin-left: 60px; margin-right: 60px; list-style-type: none; display: flex; flex-direction: row; gap: 30px; flex-wrap: wrap;">`+result+`</ul>`;
        document.getElementById("content").innerHTML = ul;
    });

} else if (document.location.pathname == "/read") {
    let params = new URL(document.location).searchParams;
    let code = params.get("code");
    let date = params.get("date");
    api.current(code, date).then(a => {
        document.getElementById("content").innerHTML = `<book-link code="${a.code}" status="${a.status.status}" date="${a.date}" current="${a.status.current}" total="${a.status.total}" date="${a.date}" name="${a.name}" readableDate="${dateh.toReadable(a.date)}"></book-link>
        <a href="/archives?code=${a.code}">archives</a>`;
    });

} else if (document.location.pathname == "/archives") {
    let params = new URL(document.location).searchParams;
    let code = params.get("code");
    api.archives(code).then(as => {
        let links2 = as.map(a => {
            return `<book-link code="${a.code}" status="${a.status.status}" date="${a.date}" current="${a.status.current}" total="${a.status.total}" name="${a.name}" readableDate="${dateh.toReadable(a.date)}"></book-link>`;
        });
        let ul = `<ul>`+links2.map(i => `<li>${i}</li>`).join("")+`</ul>`;
        document.getElementById("content").innerHTML = ul;
    });
}
