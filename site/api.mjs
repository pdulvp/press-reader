var api = {
    list: function() {
        return fetch("api/list").then(e => {
            return e.json();
        });
    },
    current: function(code, date) {
        return fetch(`api/read?code=${code}&date=${date}`).then(e => {
            return e.json();
        });
    },
    archives: function(code) {
        return fetch(`api/archives?code=${code}`).then(e => {
            return e.json();
        });
    }
};
export { api }