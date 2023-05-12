
const cacheh = require("./cacheh");
const fsh = require("./fsh");
const promiseh = require("./promiseh");
const fs = require("fs");
const dateh = require("./dateh");
const ziph = require("./ziph");
const util = require('util');

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
    return accessorh.getBooks().then(result => {
      return Promise.all(result.map(r => getStatus(r.code, r.latest.date))).then(res => {
        result.forEach((v, i) => {
            result[i].latest.status = res[i].status,
            result[i].latest.current = res[i].current,
            result[i].latest.total = res[i].total
        });
        return Promise.resolve(result)
      });
    });
}

function getArchives(code) {
    //window.parent.location.href='/Login?ErrorCode=1';
    return new Promise((resolve, reject) => {
    accessorh.getArchives(code).then(dates => {
        Promise.all(dates.map(r => getStatus(code, r.date))).then(res => {
            dates.forEach((v, i) => {
                dates[i].status = res[i].status,
                dates[i].current = res[i].current,
                dates[i].total = res[i].total
            });
            resolve(dates);
          });
        });
    });
}
function getCurrent(code, date) {
    return getStatus(code, date).then(s => {
        return Promise.resolve({
            code: code, 
            date: date,
            status: s
        });
    });
}

function getPages(code, date) {
    date = dateh.formatDate(date, "-");
    return accessorh.getPages(code, date);
}

function searchDownloadedPages(folder) {
    return fsh.getFiles(folder).then(files => {
        return Promise.resolve(files.filter(file => file.endsWith(".png") && !(file.endsWith("thumbnail.png"))));
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

function downloadComplet(code, date, type = null) {
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

                ea = e.filter(r => {
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

                    return accessorh.fetchImage(imageFile, imageId).then(tt => {
                        if (e[0] == imageId) {
                            return new Promise((resolve2, reject) => {
                                if (fsh.fileExists(imageFile)) {
                                    let thumb = `${folder}/thumbnail.png`;
                                    fs.copyFileSync(imageFile, thumb);
                                    let mainThumb = `${folder}/../thumbnail.png`;
                                    fs.copyFileSync(imageFile, mainThumb);
                                }
                                resolve2(true);
                            });
                        } else {
                            return Promise.resolve(true);
                        }
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
    let folder = `results/${code}`;
    if (date != null) {
        date = dateh.formatDate(date, "-");
        folder += `/${date}`
    }
    let thumb = `${folder}/thumbnail.png`;
    if (!fsh.fileExists(thumb)) {
        thumb = `results/${code}/thumbnail.png`;
    }
    
    if (!fsh.fileExists(thumb)) {
        thumb = "thumbnail.png";
    }
    return new Promise((resolve, reject) => {
      fs.readFile(thumb, "binary", (err, data) => {
          if (err) reject(err);
          resolve(data);
      });
    });
  }

var domainh = {
    getBooks: getBooks,
    getCurrent: getCurrent,
    getArchives: getArchives,
    getComplet: getComplet,
    downloadComplet: downloadComplet,
    stopDownload: stopDownload,
    getThumbnail: getThumbnail, 
    getDownloads: (code) => { return Promise.resolve(currentDownloads.filter(c => code == null || c.code == code)); },
    getStatus: getStatus
}

module.exports = (accessor) => {
    accessorh = accessor;
    return domainh;
};
