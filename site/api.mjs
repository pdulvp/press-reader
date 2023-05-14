import { default as sampleDomainh } from "./accessorh/sampleh.mjs"

var api = {
    list: function() {
       /* return fetch("api/list").then(e => {
            return e.json();
        });*/
        return sampleDomainh.getBooks();
    },
    current: function(code, date) {
        return fetch(`api/read?code=${code}&date=${date}`).then(e => {
            return e.json();
        });
    },
    archives: function(code) {
        /*return fetch(`api/archives?code=${code}`).then(e => {
            return e.json();
        });*/
        return sampleDomainh.getArchives(code);
    },
    stop: function(code, date) {
        return fetch(`api/stop?code=${code}&date=${date}`).then(e => {
            return e.json();
        });
    },
    download: function(code, date) {
        return fetch(`api/download?code=${code}&date=${date}`).then(e => {
            return e.json();
        });
    },
    downloads: function() {
        return fetch(`api/downloads`).then(e => {
            return e.json();
        });
    }
};
export { api }