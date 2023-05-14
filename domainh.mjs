
import fsh from "./fsh.js";
import promiseh from "./promiseh.js";
import fs from "fs";
import { dateh } from "./site/dateh.mjs";
import ziph from "./ziph.js";

let currentDownloads = [];
let accessorh = null;

function findDownload(code, date, create = true) {
    date = dateh.formatDate(date, "-");
    let result = currentDownloads.find(x => x.code == code && x.date == date);
    if (result == undefined && create) {
        result = {code: code, date: date, total: 0, current: 0, inProgress: false};
        currentDownloads.push(result);
    }
    return result;
}

function getBooks() {
    return accessorh.getBooks();
}

function getArchives(code) {
    //window.parent.location.href='/Login?ErrorCode=1';
    return accessorh.getArchives(code);
}

function getPages(code, date) {
    console.log("getPages"+code+" "+date);
    date = dateh.formatDate(date, "-");
    return accessorh.getPages(code, date);
}

function searchDownloadedPages(folder) {
    return fsh.getFiles(folder).then(files => {
        return Promise.resolve(files.filter(file => file.endsWith(".png") && !(file.endsWith("thumbnail.png"))));
    });
}

function getStatuses(codes) {
    return Promise.all(codes.map(r => getStatus(r.code, r.date))).then(res => {
        codes.forEach((v, i) => {
            codes[i].status = res[i];
        });
        return Promise.resolve(codes);
    });
}

function getStatus(code, date) {
    return new Promise((resolve, reject) => {
        date = dateh.formatDate(date, "-");
        let folder = `results/${code}/${date}`;
        let outputFile = `${folder}/${code}_${date}.cbz`;
        if (fsh.fileExists(outputFile)) {
            resolve({status: "complete"});
            
        } else {
            let download = findDownload(code, date, false);
            if (download != null) {
                if (download.inProgress) {
                    resolve({status: "in progress", current: download.current, total: download.total });
                } else {
                    resolve({status: "stopped", current: download.current, total: download.total });
                }
            } else {
                searchDownloadedPages(folder).then(files => {
                    if (files.length > 0) { //previous partial
                        getPages(code, date).then(pages => {
                            resolve({status: "partial", current:files.length, total: pages.length});
                        }).catch(e => {
                            resolve({status: "error:"+e});
                        });
                    } else {
                        resolve({status: "empty"});
                    }
                });
            }
        }
    });
}

function getComplet(code, date) {
    date = dateh.formatDate(date, "-");
    let folder = `results/${code}/${date}`;
    let outputFile = `${folder}/${code}_${date}.cbz`;
    let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

    return new Promise((resolve, reject) => {
        if (fsh.fileExists(outputFile)) {
            resolve(outputFile);

        } else {
            searchDownloadedPages(folder).then(files => {
                if (files.length == 0) {
                    resolve("empty");
                } else {
                    ziph.createZip(files, outputPartialFile);
                    resolve(outputPartialFile);
                }
            });
            // If empty, then ret
        }
    }).then(e => {
        console.log(e);
        return new Promise((resolve2, reject) => {
          if (e != "empty") {
            fs.readFile(e, "binary", (err, data) => {
            if (err) reject(err);
              resolve2(data);
            });
          } else {
            resolve2("empty");
          }
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

function download(code, date, type = null) {
    date = dateh.formatDate(date, "-");
    let folder = `results/${code}/${date}`;
    let outputFile = `${folder}/${code}_${date}.cbz`;
    let outputPartialFile = `${folder}/${code}_${date}-partial.cbz`;

    return new Promise((resolve, reject) => {
      if (fsh.fileExists(outputFile)) {
        resolve({status : "downloadComplete"});

      } else {
        let download = findDownload(code, date);
        console.log(currentDownloads);
        if (!download.inProgress) {
            download.inProgress = true;
            getPages(code, date).then(e => {
                download.total = e.length;

                let ea = e.filter(r => {
                    let imageFile = `${folder}/${r}.png`;
                    return !fsh.fileExists(imageFile);
                });
                download.current = download.total - ea.length;
                if (type == "cover") {
                    ea = ea.slice(0, 1);
                } else if (type != "full") {
                    ea = ea.slice(0, 3);
                }
                promiseh.consecutive(ea, (imageId) => {
                    if (download.inProgress == false) {
                        return Promise.resolve(false);
                    }
                    let imageFile = `${folder}/${imageId}.png`;
                    download.current++;
                    console.log(download);

                    return accessorh.getImage(imageId).then(tt => {
                        return fsh.write(imageFile, tt).then(e => {
                            console.log('The file has been saved!');
                            return Promise.resolve(true);
                        });
                    }).then(promiseh.wait);
                
                }).then(ee => {
                    if (download.total == download.current) {
                        searchDownloadedPages(folder).then(files => {
                            ziph.createZip(files, outputFile);
                            download.inProgress = false;
                        });
                    } else {
                        download.inProgress = false;
                    }
                });
                resolve({status : "inProgress"});
            });
        } else {
            resolve({status : "inProgress"});
        }
      }
    }).then(e => {
      console.log(e);
      return Promise.resolve(e);
    });
  }

  function getThumbnail(code, date) {
    let thumb = undefined;
    
    return new Promise((resolve, reject) => {
      if (date != null && date != "null" && code != null && code != "null") {
        date = dateh.formatDate(date, "-");
        thumb = `results/${code}/${date}/thumbnail.png`;
        if (fsh.fileExists(thumb)) {
            resolve({status: "date", thumb: thumb})
        } else if (fsh.fileExists(`results/${code}/${date}`)) {
            getPages(code, date).then(e => {
                console.log("getPages2");
                console.log(e);
                let imageId = e[0];
                let imageFile = `results/${code}/${date}/${imageId}.png`;
                if (fsh.fileExists(imageFile)) {
                  fs.copyFileSync(imageFile, thumb);
                  resolve({status: "date", thumb: thumb})
                }
                reject();
            });
        } else {
            reject();
        }
        
      } else {
        reject();
      }

    }).catch(e => {
        return Promise.resolve({status: "default", thumb: `thumbnail.png`})

    }).then(e => {
        return new Promise((resolve, reject) => {
            fs.readFile(e.thumb, "binary", (err, data) => {
                if (err) reject(err);
                resolve({ status: e.status, thumbnail: data });
            });
        });
    })
  }

var domainh = {
    getBooks: getBooks,
    getArchives: getArchives,
    getComplet: getComplet,
    download: download,
    stopDownload: stopDownload,
    getThumbnail: getThumbnail, 
    getDownloads: (code) => { return Promise.resolve(currentDownloads.filter(c => code == null || c.code == code)); },
    getStatus: getStatus,
    getStatuses: getStatuses
}

export default function (accessor) {
    accessorh = accessor;
    return domainh;
};
