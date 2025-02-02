import fs from 'fs';
import http from "http";
import fDomainh from "./domainh.mjs";
import requesth from "./utils/requesth.js"
import urlh from './utils/urlh.js';
import consoleh from './utils/consoleh.js';
import promiseh from './utils/promiseh.js';
import { ContentTypes } from "./ContentTypes.mts";

let accessors = process.argv.slice(2);
if (accessors.length == 0) {
  console.log("An accessor to a press service is required");
  process.exit();
}

let unaccessibleAccessors = accessors.filter(a => !fs.existsSync("./" + a));
if (unaccessibleAccessors.length > 0) {
  console.log("The specified accessors doesn't exist:" + unaccessibleAccessors);
  process.exit();
}

function combine(accessorhs) {
  let coveringAccessor = {};
  let cover = (code) => {
    if (Object.keys(coveringAccessor).length == 0) {
      return Promise.all(accessorhs.map(a => a.getBooks())).then(bookResults => {
        bookResults.forEach((books, index) => books.forEach(book => coveringAccessor[book.code] = accessorhs[index]));
        console.log(code+"="+coveringAccessor[code].name);
        return Promise.resolve(coveringAccessor[code]);
      });
    } else {
      console.log(code+"="+coveringAccessor[code].name);
      return Promise.resolve(coveringAccessor[code]);
    }
  }
  return {
    getBooks: () => {
      return Promise.all(accessorhs.map(a => a.getBooks())).then(books => {
        return Promise.resolve(books.reduce((o,i) => o.concat(i), []));
      });
    },
    getPages: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getPages(code, date);
        return Promise.reject("unsupported code");
      } );
    },
    getArchives: (code) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getArchives(code);
        return Promise.reject("unsupported code");
      } );
    },
    getImage: (code, imageId) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getImage(code, imageId);
        return Promise.reject("unsupported code");
      } );
    },
    getFull: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getFull(code, date);
        return Promise.reject("unsupported code");
      } );
    },
    isFull: (code) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.isFull(code);
        return Promise.reject("unsupported code");
      } );
    },
    getThumbnail: (code, date) => {
      return cover(code).then(accessor => {
        if (accessor) return accessor.getThumbnail(code, date);
        return Promise.reject("unsupported code");
      } );
    },
  }
}

console.log(accessors);
let accessorModules = [];
for (let i=0; i<accessors.length; i++) {
  const module = await import("./" + accessors[i]);
  accessorModules.push(module.default);
}

console.log("Loaded accessors: " + accessors);
console.log("Loaded accessor modules: " + accessorModules);
let accessorh = combine(accessorModules);
var domainh = fDomainh(accessorh);

var api = {
  list: accessorh.getBooks,
  archives: accessorh.getArchives,
  fetch: {
    status: domainh.getStatus,
    read: domainh.read,
    download: domainh.download,
    downloads: domainh.getDownloads,
    stop: domainh.stopDownload,
    thumb: domainh.getThumbnail,
  },
}

console.log(api);

var processor = {
  head: {},
  writeHead: (type, value) => { processor.head[type] = value },
  end: (res, lastContent, type) => {
    if (type) {
      processor.writeHead("Content-Type", type.contentType);
    }
    res.writeHead(200, processor.head);
    res.end(lastContent, type.encoding);
    processor.head = {};
  }
};

function proceedRequest(request, res) {
  let url = new URL("https://" + hostname + request.url);
  console.log(url.pathname + " " + url.searchParams);

  let rules = {
    code: (code) => { return { status: code != null && code.match(/^[a-zA-Z0-9_-]+$/) != null, msg: "code invalid format" } },
    date: (date) => { return { status: date != null && date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) != null, msg: "date invalid format" } },
    download: {
      type: (type) => { return { status: type == "cover" || type == "full" || type == null, msg: "type invalid format" } }
    }
  };

  let customElements = ["customElements/BooksList", "customElements/StatusImage", "customElements/BookLink", "customElements/BookPanel", "customElements/ArchivesPanel", "customElements/SpinProgress",
    "customElements/SpinProgress.domain", "customElements/NavHeader", "customElements/BackgroundPanel", "customElements/DownloadsPanel", "customElements/SidePanel"];

  let modules = ["api", "domh", "index", "dateh", "accessorh/sampleh"];

  let css = ["css/main"];

  let file = request.url.substring(1, request.url.length - 4);

  let errorHandler = (e) => {
    consoleh.red(e);
    processor.end(res, JSON.stringify({ status: "error", message: `An error occured. See logs` }, null, ""), ContentTypes.JSON);
  };

  if (modules.includes(file) || customElements.includes(file)) {
    processor.end(res, fs.readFileSync("site/" + file + ".mjs"), ContentTypes.MJS);

  } else if (css.includes(file)) {
    processor.end(res, fs.readFileSync("site/" + file + ".css"), ContentTypes.CSS);

  } else if (request.url == '/') {
    processor.end(res, fs.readFileSync("site/index.html"), ContentTypes.HTML);

  } else if (url.pathname == '/api/list') {
    api.list().then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.JSON);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/archives') {
    let { code } = urlh.params(url, { code: rules.code });
    api.archives(code).then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.JSON);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/status') {
    requesth.json(request).then(json => {
      api.fetch.status(json).then(e => {
        processor.end(res, JSON.stringify(e, null, ""), ContentTypes.JSON);
      })
    }).catch(errorHandler);

  } else if (url.pathname == '/thumb') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.thumb(code, date).then(r => {
      processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".png");
      processor.writeHead("X-Thumbnail-Status", r.status);
      processor.end(res, r.thumbnail, ContentTypes.PNG);
    }).catch(errorHandler);

  } else if (url.pathname == '/read') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.read(code, date).then(r => {
      if (r.status == undefined) {//TODO PDF
        processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + "." + r.type);
        processor.end(res, r.data, r.type == "cbz" ? ContentTypes.CBZ: ContentTypes.PDF);
      } else {
        processor.end(res, JSON.stringify(r, null, ""), ContentTypes.JSON);
      }
    }).catch(errorHandler);

  } else if (url.pathname == '/api/download') {
    let { code, date, type } = urlh.params(url, { code: rules.code, date: rules.date, type: rules.download.type });
    api.fetch.download(code, date, type).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.JSON);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/downloads') {
    api.fetch.downloads(null).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.JSON);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/stop') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.stop(code, date).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.JSON);
    }).catch(errorHandler);

  } else {
    processor.end(res, JSON.stringify({ status: "error", message: `Unknown url: ${request.url}` }, null, ""), ContentTypes.JSON);
  }
}

//const hostname = "192.168.1.18";
const hostname = "127.0.0.1";
const port = 8098;
const server = http.createServer();

server.on("request", (request, res) => {
  res.on("error", e => {
    consoleh.red(e);
  });
  try {
    proceedRequest(request, res);
  } catch (e) {
    consoleh.red(e);
    processor.end(res, JSON.stringify({ status: "error", message: `An error occured. See logs` }, null, ""), ContentTypes.JSON);
  }
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
