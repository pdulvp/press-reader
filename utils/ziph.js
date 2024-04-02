
var AdmZip = require("adm-zip");
function createZip(files, output) {
  return new Promise((resolve, reject) => {
    var zip = new AdmZip();
    files.forEach(f => {
      zip.addLocalFile(f);
    });
    zip.writeZip(output);
    resolve(true);
  });
}
function unzipDomain(buffer, outputFolder, outputFullFile) {
  var zip = new AdmZip(buffer);
  var zipEntries = zip.getEntries();

  zipEntries.filter(ze => ze.name.endsWith(".jpg") || ze.name.endsWith(".png")).forEach(ze => {
    zip.extractEntryTo(ze, outputFolder, false);
  });
  
  let maxPdf = zipEntries.filter(ze => ze.name.endsWith(".pdf")).reduce((result,ze) => {
    if (!result) return ze;
    return result.getData().length > ze.getData().length ? result : ze;
  }, null);
  if (maxPdf) {
    zip.extractEntryTo(maxPdf, outputFolder, false, true, false, outputFullFile);
  }
}

function unzip(buffer, outputFolder) {
  var zip = new AdmZip(buffer);
  zip.extractAllTo(outputFolder, true);
}

var ziph = {
  createZip: createZip,
  unzip: unzip,
  unzipDomain: unzipDomain
}

module.exports = ziph;
