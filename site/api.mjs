
var api = {
    list: function() {
       return fetch("api/list").then(e => {
            return e.json();
        });
    },
    archives: function(code) {
        return fetch(`api/archives?code=${code}`).then(e => {
            return e.json();
        });
    },
    fetch: {
        status: function(codes) {
            return fetch(`api/status`, {
                method: "POST", body: JSON.stringify(codes) }).then(e => {
                return e.json();
            });
        },
        read: function(code, date) {
            return fetch(`api/read?code=${code}&date=${date}`).then(e => {
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
        },
        stop: function(code, date) {
            return fetch(`api/stop?code=${code}&date=${date}`).then(e => {
                return e.json();
            });
        },
        thumb: function(code, date) {
            return fetch(`thumb?code=${code}&date=${date}`).then(e => {
                return new Promise(function(resolve, reject) {
                    e.arrayBuffer().then(arrayBuffer => {
                        resolve({ status: e.headers.get("x-thumbnail-status"), arrayBuffer: arrayBuffer })
                    })
                });
            }).then(value => {
                var base64 = btoa(
                    new Uint8Array(value.arrayBuffer)
                      .reduce((data, byte) => data + String.fromCharCode(byte), '')
                  );
                return Promise.resolve({ status: value.status, thumbnail: "data:image/png;base64, "+base64 } );
            });
        }
    }
};
export { api }