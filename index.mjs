import fs from 'fs';
import http from "http";

if (process.argv[2] == undefined) {
  console.log("An accessor to a press service is required");
  process.exit();
}
if (!fs.existsSync("./"+process.argv[2])) {
  console.log("The specified accessor doesn't exist");
  process.exit();
}

const module = await import("./"+process.argv[2]);
let accessorh = module.default;
console.log("accessorh");
console.log(accessorh);

import fDomainh from "./domainh.mjs";
var domainh = fDomainh(accessorh);
console.log("domainh");
console.log(domainh);

var ContentTypes = { 
	cbz:   { contentType: 'application/zip', encoding: "binary" },
	cjs:   { contentType: 'text/javascript', encoding: "utf-8" },
	mjs:   { contentType: 'text/javascript', encoding: "utf-8" },
	js:    { contentType: 'text/javascript', encoding: "utf-8" },
	css:   { contentType: 'text/css', encoding: "utf-8" },
	woff2: { contentType: 'font/woff2', encoding: "binary" },
	json:  { contentType: 'application/json', encoding: "utf-8" },
	png:   { contentType: 'image/png', encoding: "binary" },
	jpg:   { contentType: 'image/jpg', encoding: "binary" },
	pdf:   { contentType: 'pdf', encoding: "binary" },
	ttf:   { contentType: 'font/ttf', encoding: "binary" },
	html:  { contentType: 'text/html; charset=utf-8', encoding: "utf-8" },
	map:   { contentType: 'text/plain', encoding: "utf-8" },
	svg:   { contentType: 'image/svg+xml', encoding: "utf-8" },
};

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
  console.log(url.pathname + " "+url.searchParams);

  let customElements = ["customElements/BooksList", "customElements/BookLink", "customElements/BookPanel", "customElements/ArchivesPanel", "customElements/SpinProgress", 
  "customElements/SpinProgress.domain", "customElements/NavHeader", "customElements/BackgroundPanel", "customElements/DownloadsPanel", "customElements/SidePanel"];
  let file = request.url.substring(1, request.url.length - 4);
  
  if (request.url == '/api.mjs') {
    processor.end(res, fs.readFileSync("site/api.mjs"), ContentTypes.js);

  } else if (request.url == '/index.mjs') {
    processor.end(res, fs.readFileSync("site/index.mjs"), ContentTypes.js);

  } else if (customElements.includes(file)) {
    processor.end(res, fs.readFileSync("site/"+file+".mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/dateh.mjs') {
    processor.end(res, fs.readFileSync("site/dateh.mjs"), ContentTypes.js);
    
  } else if (request.url == '/css/main.css') {
    processor.end(res, fs.readFileSync("site/css/main.css"), ContentTypes.css);
    
  } else if (request.url == '/accessorh/sampleh.mjs') {
    processor.end(res, fs.readFileSync("site/accessorh/sampleh.mjs"), ContentTypes.js);
    
  } else if (request.url == '/') {
    processor.end(res, fs.readFileSync("site/index.html"), ContentTypes.html);

  } else if (request.url == '/debug') {
    processor.end(res, fs.readFileSync("site/index.html"), ContentTypes.html);

  } else if (url.pathname == '/api/list') {
    domainh.getBooks().then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
    });

  } else if (url.pathname == '/api/archives') {
    let code = url.searchParams.get("code");
    domainh.getArchives(code).then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
    });

  } else if (url.pathname == '/api/status') {
    let body = [];
    request.on('error', (err) => {
    }).on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      domainh.getStatus(JSON.parse(body)).then(e => {
        processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
      })
    });
    
  } else if (url.pathname == '/thumb') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    domainh.getThumbnail(code, date).then(r => {
      processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".png");
      processor.writeHead("X-Thumbnail-Status", r.status);
      processor.end(res, r.thumbnail, ContentTypes.png);
    });
    
  } else if (url.pathname == '/readCurrent') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    domainh.getComplet(code, date).then(r => {
      if (r.status == undefined) {
        processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".cbz");
        processor.end(res, r, ContentTypes.cbz);
      } else {
        processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
      }
    });

  } else if (url.pathname == '/api/download') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    let type = url.searchParams.get("type");
    domainh.download(code, date, type).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    });

  } else if (url.pathname == '/api/downloads') {
    domainh.getDownloads(null).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    });

  } else if (url.pathname == '/api/stop') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    domainh.stopDownload(code, date).then(r => {
      processor.end(res, JSON.stringify(r, null, ""), ContentTypes.json);
    });

  } else {
    processor.end(res, JSON.stringify({status: "error", message: `Unknown url: ${request.url}`}, null, ""), ContentTypes.json);
  }
}

//const hostname = "192.168.1.18";
const hostname = "127.0.0.1";
const port = 8098;
const server = http.createServer();
server.on("request", (request, res) => {
  try {
    proceedRequest(request, res);
  } catch (e) {
    processor.end(res, JSON.stringify({status: "error", message: `An error occured : ${e}`}, null, ""), ContentTypes.json);
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
