
import fsh from "./utils/fsh.js";
import promiseh from "./utils/promiseh.js";
import fs from "fs";
import { dateh } from "./site/dateh.mjs";
import ziph from "./utils/ziph.js";
let currentDownloads = [];
let accessorh = null;

function findDownload(code, date, create = true) {
  date = dateh.formatDate(date, "-");
  let result = currentDownloads.find(x => x.code == code && x.date == date);
  if (result == undefined && create) {
    result = { code: code, date: date, total: 0, current: 0, inProgress: false };
    currentDownloads.push(result);
  }
  return result;
}

function getPages(code, date) {
  date = dateh.formatDate(date, "-");
  return accessorh.getPages(code, date);
}

function isFull(code) {
  return accessorh.isFull(code);
}

function searchDownloadedPages(folder) {
  return fsh.getFiles(folder).then(files => {
    let pages = files.filter(file => (file.endsWith(".png") || file.endsWith(".jpg")) && !(file.endsWith("thumbnail.png")));
    return Promise.resolve(pages);
  });
}

function getStatus(codes) {
  return Promise.all(codes.map(r => unaryStatus(r.code, r.date))).then(res => {
    codes.forEach((v, i) => {
      codes[i].status = res[i];
    });
    return Promise.resolve(codes);
  });
}

function unaryStatus(code, date) {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFile = `${folder}/${code}_${date}.cbz`;

  if (fsh.fileExists(outputFile)) {
    return Promise.resolve({ status: "complete" });
  }
 
  let download = findDownload(code, date, false);
  if (download != null) {
    if (download.inProgress) {
      return Promise.resolve({ status: "in progress", current: download.current, total: download.total });
    } else {
      return Promise.resolve({ status: "stopped", current: download.current, total: download.total });
    }
  }

  return new Promise((resolve, reject) => {
    searchDownloadedPages(folder).then(files => {
      if (files.length > 0) { //previous partial
        getPages(code, date).then(pages => {
          resolve({ status: "partial", current: files.length, total: pages.length });
        }).catch(e => {
          resolve({ status: "error:" + e });
        });
      } else {
        resolve({ status: "empty" });
      }
    });
  });
}

function read(code, date) {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFile = `${folder}/${code}_${date}.cbz`;
  let outputFilePDF = `${folder}/${code}_${date}.pdf`;
  let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

  return new Promise((resolve, reject) => {
    if (fsh.fileExists(outputFile)) {
      resolve(outputFile);

    } else if (fsh.fileExists(outputFilePDF)) {
      resolve(outputFilePDF);

    } else {
      searchDownloadedPages(folder).then(files => {
        if (files.length > 0) {
          ziph.createZip(files, outputPartialFile);
          resolve(outputPartialFile);
        } else {
          reject({ status: "empty" });
        }
      });
    }
  }).then(e => {
    return new Promise((resolve, reject) => {
      fs.readFile(e, "binary", (err, data) => {
        if (err) reject(err);
        resolve({ type: e.endsWith(".cbz")?"cbz":"pdf", data: data });
      });
    });
  });
}

function stopDownload(code, date) {
  date = dateh.formatDate(date, "-");
  let dnld = findDownload(code, date, false);
  if (dnld != null) {
    dnld.inProgress = false;
  }
  return Promise.resolve(true);
}

let pagesQueue = promiseh.newQueue(() => Math.round(Math.random() * 2000) + 3000);
let imagesQueue = promiseh.newQueue(() => Math.round(Math.random() * 18000) + 15000);
let fullQueue = promiseh.newQueue(() => Math.round(Math.random() * 2000) + 3000);

function download(code, date, type = null) {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFileName = `${code}_${date}.cbz`;
  let outputFileNamePDF = `${code}_${date}.pdf`;
  let outputFile = `${folder}/${outputFileName}`;
  let outputFilePDF = `${folder}/${outputFileName}`;
  let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

  if (fsh.fileExists(outputFile) || fsh.fileExists(outputFilePDF)) {
    return Promise.resolve({ status: "downloadComplete" });
  }

  let download = findDownload(code, date);
  console.log(currentDownloads);
  if (download.inProgress) {
    return Promise.resolve({ status: "inProgress" });
  }

  download.inProgress = true;

  if (!isFull(code)) {
    pagesQueue.push(() => {
      return getPages(code, date).then(allPages => {
        download.total = allPages.length;

        let remainingPages = allPages.filter(r => {
          let imageFile = `${folder}/${r}.png`;
          return !fsh.fileExists(imageFile);
        });
        download.current = download.total - remainingPages.length;
        if (type == "cover") {
          remainingPages = remainingPages.slice(0, 1);
        } else if (type != "full") {
          remainingPages = remainingPages.slice(0, 3);
        }

        imagesQueue.push(remainingPages.map((page, i) => () => {
          console.log(`proceed image ${page}`);
          let imageId = page;
          if (download.inProgress == false) {
            return Promise.resolve(false);
          }
          let imageFile = `${folder}/${imageId}.png`;
          download.current++;

          return accessorh.getImage(imageId).then(tt => {
            return fsh.write(imageFile, tt);
          }).then(e => {
            console.log('The file has been saved!');
            return Promise.resolve(true);
          }).then(ee => {
            if (download.total == download.current) {
              return searchDownloadedPages(folder).then(files => {
                return ziph.createZip(files, outputFile);
              }).then(e => {
                download.inProgress = false;
                return Promise.resolve(true);
              });
            } else if (i == remainingPages.length - 1) {
              download.inProgress = false;
              return Promise.resolve(true);
            }
          });
        }), type == "cover");
      });
    });
  } else {
    fullQueue.push(() => {
      console.log("Full download of " + code + " " + date);
      let fullFolder = `${folder}`;
      return accessorh.getFull(code, date).then(res => {
        return fsh.mkdir(fullFolder).then(e => {
          return ziph.unzipDomain(res, fullFolder, outputFileNamePDF, (total, progress) => {
            download.total = total;
            download.current = Math.floor(progress / 2);
          });
        });
      }).then(e => {
        console.log('The pages has been saved!');
        return searchDownloadedPages(folder);
      }).then(files => {
        if (files == 0) {
          return Promise.resolve({ status: "complete" });
        }
        return ziph.createZip(files, outputFile, (total, progress) => {
          download.current = Math.floor(download.total / 2) + Math.floor(progress / 2);
        });
      }).then(e => {
        console.log('The pdf has been saved!');
        download.inProgress = false;
        download.current = download.total;
        return Promise.resolve({ status: "complete" });
      });
    });
  }
  return Promise.resolve({ status: "inProgress" });
}

function getDownloads(code) {
  let dwn = currentDownloads.filter(c => code == null || c.code == code);
  return accessorh.getBooks().then(books => {
    dwn.forEach(d => {
      let book = books.find(b => b.code == d.code);
      if (book) {
        d.name = book.name;
      } else {
        d.name = book.code;
      }
    });
    return Promise.resolve(dwn);
  });
}


function getThumbnail(code, date) {
  let thumb = undefined;

  return new Promise((resolve, reject) => {
    if (date != null && date != "null" && code != null && code != "null") {
      date = dateh.formatDate(date, "-");
      thumb = `results/${code}/${date}/thumbnail.png`;
      if (fsh.fileExists(thumb)) {
        fs.readFile(thumb, "binary", (err, data) => {
          resolve({ status: "date", thumbnail: data });
        });
      } else {
        accessorh.getThumbnail(code, date).then(imageData => {
          fsh.write(thumb, imageData, "binary");
          thumb = `results/${code}/thumbnail.png`;
          fsh.write(thumb, imageData, "binary");
          resolve({ status: "date", thumbnail: imageData });
        }).catch(e => {
          console.log(e);
          reject();
        });
      }

    } else {
      reject();
    }

  }).catch(e => {
    return new Promise((resolve, reject) => {
      if (code != null && code != "null") {
        thumb = `results/${code}/thumbnail.png`;
        if (fsh.fileExists(thumb)) {
          fs.readFile(thumb, "binary", (err, data) => {
            resolve({ status: "cover", thumbnail: data });
          });
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }).catch(e => {
    return new Promise((resolve, reject) => {
      fs.readFile(`thumbnail.png`, "binary", (err, data) => {
        resolve({ status: "default", thumbnail: data });
      });
    });
  })
}

var domainh = {
  read: read,
  download: download,
  stopDownload: stopDownload,
  getThumbnail: getThumbnail,
  getDownloads: getDownloads,
  getStatus: getStatus,
  searchDownloadedPages: searchDownloadedPages
}

export default function (accessor) {
  accessorh = accessor;
  return domainh;
};
