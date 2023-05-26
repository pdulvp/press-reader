import fs from 'fs';
import http from "http";
import fDomainh from "./domainh.mjs";
import requesth from "./utils/requesth.js"
import urlh from './utils/urlh.js';
import consoleh from './utils/consoleh.js';

if (process.argv[2] == undefined) {
  console.log("An accessor to a press service is required");
  process.exit();
}
if (!fs.existsSync("./" + process.argv[2])) {
  console.log("The specified accessor doesn't exist");
  process.exit();
}

const module = await import("./" + process.argv[2]);
var accessorh = module.default;
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

var ContentTypes = {
  cbz: { contentType: 'application/zip', encoding: "binary" },
  cjs: { contentType: 'text/javascript', encoding: "utf-8" },
  mjs: { contentType: 'text/javascript', encoding: "utf-8" },
  js: { contentType: 'text/javascript', encoding: "utf-8" },
  css: { contentType: 'text/css', encoding: "utf-8" },
  woff2: { contentType: 'font/woff2', encoding: "binary" },
  json: { contentType: 'application/json', encoding: "utf-8" },
  png: { contentType: 'image/png', encoding: "binary" },
  jpg: { contentType: 'image/jpg', encoding: "binary" },
  pdf: { contentType: 'pdf', encoding: "binary" },
  ttf: { contentType: 'font/ttf', encoding: "binary" },
  html: { contentType: 'text/html; charset=utf-8', encoding: "utf-8" },
  map: { contentType: 'text/plain', encoding: "utf-8" },
  svg: { contentType: 'image/svg+xml', encoding: "utf-8" },
};

var processor = {
  head: {},
  params: (url, rules) => {
    let result = urlh.check(url, rules);
    if (result.find(r => !r.status)) {
      throw new Error('Wrong parameters: ' + result.filter(c => !c.status).map(c => c.msg).join(","));
    }
    result = {};
    Object.keys(rules).forEach(k => result[k] = url.searchParams.get(k));
    return result;
  },

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
    code: (code) => { return { status: code != null && code.match(/^[a-zA-Z0-9_]+$/) != null, msg: "code invalid format" } },
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
    processor.end(res, JSON.stringify({ status: "error", message: `An error occured. See logs` }, null, ""), ContentTypes.json);
  };

  if (modules.includes(file) || customElements.includes(file)) {
    processor.end(res, fs.readFileSync("site/" + file + ".mjs"), ContentTypes.mjs);

  } else if (css.includes(file)) {
    processor.end(res, fs.readFileSync("site/" + file + ".css"), ContentTypes.css);

  } else if (request.url == '/') {
    processor.end(res, fs.readFileSync("site/index.html"), ContentTypes.html);

  } else if (url.pathname == '/api/list') {
    api.list().then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/archives') {
    let { code } = processor.params(url, { code: rules.code });
    api.archives(code).then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/status') {
    requesth.json(request).then(json => {
      api.fetch.status(json).then(e => {
        processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
      })
    }).catch(errorHandler);

  } else if (url.pathname == '/thumb') {
    let { code, date } = processor.params(url, { code: rules.code, date: rules.date });
    api.fetch.thumb(code, date).then(r => {
      processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".png");
      processor.writeHead("X-Thumbnail-Status", r.status);
      processor.end(res, r.thumbnail, ContentTypes.png);
    }).catch(errorHandler);

  } else if (url.pathname == '/read') {
    let { code, date } = processor.params(url, { code: rules.code, date: rules.date });
    api.fetch.read(code, date).then(r => {
      if (r.status == undefined) {
        processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".cbz");
        processor.end(res, r, ContentTypes.cbz);
      } else {
        processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
      }
    }).catch(errorHandler);

  } else if (url.pathname == '/api/download') {
    let { code, date, type } = processor.params(url, { code: rules.code, date: rules.date, type: rules.download.type });
    api.fetch.download(code, date, type).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/downloads') {
    api.fetch.downloads(null).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    }).catch(errorHandler);

  } else if (url.pathname == '/api/stop') {
    let { code, date } = processor.params(url, { code: rules.code, date: rules.date });
    api.fetch.stop(code, date).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    }).catch(errorHandler);

  } else {
    processor.end(res, JSON.stringify({ status: "error", message: `Unknown url: ${request.url}` }, null, ""), ContentTypes.json);
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
    errorHandler(e);
  }
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
