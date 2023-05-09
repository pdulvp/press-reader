const fs = require("fs");

if (process.argv[2] == undefined) {
  console.log("An accessor to a press service is required");
  process.exit();
}
if (!fs.existsSync("./accessorh/"+process.argv[2]+".js")) {
  console.log("The specified accessor doesn't exist");
  process.exit();
}

const accessorh = require("./accessorh/"+process.argv[2]);
const domainh = require("./domainh")(accessorh);

http = require("http");

var ContentTypes = { 
	cbz: 'application/zip',
	cjs: 'text/javascript',
	mjs: 'text/javascript',
	js: 'text/javascript',
	css: 'text/css',
	woff2: 'font/woff2',
	json: 'application/json',
	png: 'image/png',
	jpg: 'image/jpg',
	pdf: 'pdf',
	ttf: 'font/ttf',
	html: 'text/html; charset=utf-8',
	map: 'text/plain',
	svg: 'image/svg+xml'
};


var processor = {
  head: {},
  writeHead: (type, value) => { processor.head[type] = value },
  end: (res, lastContent, type) => { 
    if (type) {
      processor.writeHead("Content-Type", type);
    }
    res.writeHead(200, processor.head);
    res.end(lastContent, type == ContentTypes.html ? "utf-8": "binary");
    processor.head = {};
  }
};

function proceedRequest(request, res) {
  let url = new URL("https://" + hostname + request.url);
  console.log(url.pathname + " "+url.searchParams);

  if (request.url == '/api.mjs') {
    processor.end(res, fs.readFileSync("site/api.mjs"), ContentTypes.js);

  } else if (request.url == '/index.mjs') {
    processor.end(res, fs.readFileSync("site/index.mjs"), ContentTypes.js);

  } else if (request.url == '/CloseBtn.js') {
    processor.end(res, fs.readFileSync("site/customElements/CloseBtn.js"), ContentTypes.js);

  } else if (request.url == '/BookLink.js') {
    processor.end(res, fs.readFileSync("site/customElements/BookLink.js"), ContentTypes.js);
    
  } else if (request.url == '/BookPanel.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/BookPanel.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/ArchivesPanel.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/ArchivesPanel.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/dateh.mjs') {
    processor.end(res, fs.readFileSync("site/dateh.mjs"), ContentTypes.js);
    
  } else if (request.url == '/main.css') {
    processor.end(res, fs.readFileSync("site/css/main.css"), ContentTypes.css);
    
  } else if (request.url == '/SpinProgress.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/SpinProgress.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/NavHeader.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/NavHeader.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/BackgroundPanel.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/BackgroundPanel.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/DownloadsPanel.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/DownloadsPanel.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/SidePanel.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/SidePanel.mjs"), ContentTypes.mjs);
    
  } else if (request.url == '/SpinProgress.domain.mjs') {
    processor.end(res, fs.readFileSync("site/customElements/SpinProgress.domain.mjs"), ContentTypes.mjs);
    
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

  } else if (url.pathname == '/api/read') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    domainh.getCurrent(code, date).then(e => {
      processor.end(res, JSON.stringify(e, null, ""), ContentTypes.json);
    });

  } else if (url.pathname == '/thumb') {
    let code = url.searchParams.get("code");
    let date = url.searchParams.get("date");
    domainh.getThumbnail(code, date).then(r => {
      processor.writeHead("Content-Disposition", "attachment;filename=" + code + date + ".png");
      processor.end(res, r, ContentTypes.png);
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
    domainh.downloadComplet(code, date, type).then(r => {
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

if (true) return
