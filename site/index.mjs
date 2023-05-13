import { api } from "./api.mjs"
import { dateh } from "./dateh.mjs"

if (document.location.pathname == "/" || document.location.pathname == "/index.html") {
    document.getElementById("content").innerHTML = `<books-list></books-list>`;
}
