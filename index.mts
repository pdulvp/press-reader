import fs from 'fs';
import http from "http";
import fDomainh from "./domainh.mts";
import { type Rule, type Rules, urlh } from './utils/urlh.mts';
import { consoleh } from './utils/consoleh.mts';
import { type ContentType, ContentTypes, from as ContentTypeFrom } from "./ContentTypes.mts";
import { createProcessor, type RequestProcessor } from "./RequestProcessor.mts";

import { type Accessor, type Page, type Code, type Date, type Book, combine } from "./Accessor.mts";

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

console.log(accessors);
let accessorModules:any[] = [];
for (let i=0; i<accessors.length; i++) {
  const module:any = await import("./" + accessors[i]);
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

const rules: Rules = {
  code: (type) => {
    return { status: type != null && type.match(/^[a-zA-Z0-9_-]+$/) != null, msg: "code invalid format" }
  }, 
  date: (type) => {
      return { status: type != null && type.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/) != null, msg: "date invalid format" }
  },
  downloadType: (type) => {
      return {  status: type == "cover" || type == "full" || type == "slice", msg: "type invalid format" }
  }
};


function proceedRequest(processor: RequestProcessor, onError: (e: Error) => void) {

  let allowedFiles = 
  [ "customElements/BooksList.mjs", 
    "customElements/StatusImage.mjs", 
    "customElements/BookLink.mjs", 
    "customElements/BookPanel.mjs", 
    "customElements/ArchivesPanel.mjs", 
    "customElements/SpinProgress.mjs",
    "customElements/SpinProgress.domain.mjs", 
    "customElements/NavHeader.mjs", 
    "customElements/BackgroundPanel.mjs", 
    "customElements/DownloadsPanel.mjs", 
    "customElements/SidePanel.mjs",
    "api.mjs", 
    "domh.mjs", 
    "index.mjs", 
    "dateh.mjs", 
    "accessorh/sampleh.mjs", 
    "css/main.css", 
    "index.html"
  ];
  
  let url = new URL("https://" + hostname + processor.url);
  console.log(url.pathname + " " + url.searchParams);

  let file = processor.url == '/' ? "index.html" : processor.url != undefined ? processor.url.substring(1, processor.url.length) : "<unknown>";
  if (allowedFiles.includes(file)) {
    processor.end(fs.readFileSync("site/" + file), ContentTypeFrom(file));

  } else if (url.pathname == '/api/list') {
    api.list().then(e => {
      processor.json(e);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/api/archives') {
    let { code } = urlh.params(url, { code: rules.code });
    api.archives(code).then(e => {
      processor.json(e);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/api/status') {
    processor.read.asJson().then(json => {
      api.fetch.status(json).then(e => {
        processor.json(e);
      }).catch((e) => { onError(e) });
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/thumb') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.thumb(code, date).then(r => {
      processor.writeHead("Content-Disposition", `attachment;filename=${code}${date}.png`);
      processor.writeHead("X-Thumbnail-Status", r.status);
      processor.end(r.thumbnail, ContentTypes.PNG);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/read') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.read(code, date).then(r => {
      processor.writeHead("Content-Disposition", `attachment;filename=${code}${date}.${r.type}`);
      processor.end(r.data, r.type == "cbz" ? ContentTypes.CBZ: ContentTypes.PDF);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/api/download') {
    let { code, date, type } = urlh.params(url, { code: rules.code, date: rules.date, type: rules.downloadType });
    api.fetch.download(code, date, "slice").then(r => { //type
      processor.json(r);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/api/downloads') {
    api.fetch.downloads(null).then(r => {
      processor.json(r);
    }).catch((e) => { onError(e) });

  } else if (url.pathname == '/api/stop') {
    let { code, date } = urlh.params(url, { code: rules.code, date: rules.date });
    api.fetch.stop(code, date).then(r => {
      processor.json(r);
    }).catch((e) => { onError(e) });

  } else {
    throw new Error(`Unknown url: ${processor.url}`);
  }
}

//const hostname = "192.168.1.18";
const hostname = "127.0.0.1";
const port = 8098;
const server = http.createServer();

server.on("request", (request, res) => {
  var processor = createProcessor(request, res);
  let onError = (e: Error): void => {
    if (e.message) {
      consoleh.red(e.message);
    }
    if (e.stack) {
      consoleh.red(e.stack);
    }
    processor.error(e);
  };
  res.on("error", e => {
    onError(e);
  });

  try {
    proceedRequest(processor, onError);
  } catch (e) {
    onError(e);
  }
});
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
