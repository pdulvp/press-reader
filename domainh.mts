
import fsh from "./utils/fsh.js";
import promiseh from "./utils/promiseh.js";
import fs from "fs";
import { dateh } from "./site/dateh.mjs";
import { type Accessor, type Page, type Code, type Date, type Book, type CodeAndDate } from "./Accessor.mts";
import ziph from "./utils/ziph.js";
let currentDownloads: DownloadEntry[] = [];
let accessorh: Accessor;

type Status = typeof Statuses[keyof typeof Statuses];

type Folder = string;

const Statuses = { 
  COMPLETED: "completed",
  IN_PROGRESS: "in progress",
  STOPPED: "stopped",
  ERROR: "error",
  PARTIAL: "partial",
  EMPTY: "empty"
} as const;

type CodeDateStatus = {
  code: Code, date: Date, status: Status
}

type DownloadEntry = {
  code: string;
  date: string;
  total: number;
  current: number;
  inProgress: boolean;
}

type NamedDownloadEntry = {
  code: string;
  date: string;
  total: number;
  current: number;
  inProgress: boolean;
  name: string;
}

type FileResult = {
  data: string
  type: string
}

type DownloadType = "full" | "cover" | "slice"

type ThumbnailResult = {status: "date" | "cover" | "default", thumbnail: string}

function findOrCreateDownload(code: Code, date: Date): DownloadEntry {
  date = dateh.formatDate(date, "-");
  let result = currentDownloads.find(x => x.code == code && x.date == date);
  if (result == undefined) {
    result = { code: code, date: date, total: 0, current: 0, inProgress: false };
    currentDownloads.push(result);
  }
  return result;
}

function findDownload(code: Code, date: Date): DownloadEntry | undefined {
  date = dateh.formatDate(date, "-");
  let result = currentDownloads.find(x => x.code == code && x.date == date);
  return result;
}

function getPages(code: Code, date: Date): Promise<Page[]> {
  date = dateh.formatDate(date, "-");
  return accessorh.getPages(code, date);
}

function isFull(code: Code): Promise<boolean> {
  return accessorh.isFull(code);
}

function searchDownloadedPages(folder: Folder): Promise<Page[]> {
  return fsh.getFiles(folder).then(files => {
    let pages:Page[] = files.filter(file => (file.endsWith(".png") || file.endsWith(".jpg")) && !(file.endsWith("thumbnail.png")));
    return Promise.resolve([...pages]);
  });
}

function getStatus(codes: CodeAndDate[]): Promise<CodeDateStatus[]> {
  return Promise.all(codes.map(r => unaryStatus(r.code, r.date))).then(res => {
    let result: CodeDateStatus[]= [];
    codes.forEach((v, i) => {
      result[i] = {code: codes[i].code, date: codes[i].date, status: res[i].status};
    });
    return Promise.resolve(result);
  });
}

function unaryStatus(code: Code, date: Date): Promise<{status: Status, current?: number, total?: number}>  {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFile = `${folder}/${code}_${date}.cbz`;

  if (fsh.fileExists(outputFile)) {
    return Promise.resolve({ status: "completed" });
  }
 
  let download = findDownload(code, date);
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
          resolve({ status: "error" });
        });
      } else {
        resolve({ status: "empty" });
      }
    });
  });
}

function read(code: Code, date: Date): Promise<FileResult> {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFile = `${folder}/${code}_${date}.cbz`;
  let outputFilePDF = `${folder}/${code}_${date}.pdf`;
  let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

  return new Promise<string>((resolve, reject) => {
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
        resolve({ type: e.endsWith(".cbz")? "cbz" : "pdf", data: data });
      });
    });
  });
}

function stopDownload(code: Code, date: Date) {
  date = dateh.formatDate(date, "-");
  let dnld = findDownload(code, date);
  if (dnld != null) {
    dnld.inProgress = false;
  }
  return Promise.resolve(true);
}

let pagesQueue = promiseh.newQueue(() => Math.round(Math.random() * 2000) + 3000);
let imagesQueue = promiseh.newQueue(() => Math.round(Math.random() * 18000) + 15000);
let fullQueue = promiseh.newQueue(() => Math.round(Math.random() * 2000) + 3000);

function download(code: Code, date: Date, type: DownloadType): Promise<{status: Status}> {
  date = dateh.formatDate(date, "-");
  let folder = `results/${code}/${date}`;
  let outputFileName = `${code}_${date}.cbz`;
  let outputFileNamePDF = `${code}_${date}.pdf`;
  let outputFile = `${folder}/${outputFileName}`;
  let outputFilePDF = `${folder}/${outputFileName}`;
  let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

  if (fsh.fileExists(outputFile) || fsh.fileExists(outputFilePDF)) {
    return Promise.resolve({ status: "completed" });
  }

  console.log(currentDownloads);
  let download = findOrCreateDownload(code, date);
  if (download.inProgress) {
    return Promise.resolve({ status: "in progress" });
  }
  download.inProgress = true;

  isFull(code).then(isFull => {
    if (!isFull) {
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
          } else if (type == "slice") {
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

            return accessorh.getImage(code, imageId).then(tt => {
              return fsh.write(imageFile, tt);
            }).then(e => {
              console.log('The file has been saved! ' + imageFile);
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
          if (files.length == 0) {
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
  });
  return Promise.resolve({ status: "in progress" });
}

function getDownloads(code: Code | null): Promise<NamedDownloadEntry[]> {
  let dwn = currentDownloads.filter(c => code == null || c.code == code);
  return accessorh.getBooks().then(books => {
    let result: NamedDownloadEntry[] = [];
    dwn.forEach(d => {
      let entry: NamedDownloadEntry = {code: d.code, date: d.date, total: d.total, current: d.current, inProgress: d.inProgress, name: d.code}
      result.push(entry);
      let book = books.find(b => b.code == d.code);
      if (book) {
        entry.name = book.name;
      }
    });
    return Promise.resolve(result);
  });
}

function getThumbnail(code: Code, date: Date): Promise<ThumbnailResult> {
  return new Promise<ThumbnailResult>((resolve, reject) => {
    if (date != null && date != "null" && code != null && code != "null") {
      date = dateh.formatDate(date, "-");
      let thumb = `results/${code}/${date}/thumbnail.png`;
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
    return new Promise<ThumbnailResult>((resolve, reject) => {
      if (code != null && code != "null") {
        let thumb = `results/${code}/thumbnail.png`;
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
    return new Promise<ThumbnailResult>((resolve, reject) => {
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

export default function (accessor: Accessor) {
  accessorh = accessor;
  return domainh;
};
