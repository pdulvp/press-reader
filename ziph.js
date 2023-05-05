
var AdmZip = require("adm-zip");
function createZip(files, output) {
    var zip = new AdmZip();
    files.forEach(f => {
      zip.addLocalFile(f);
    });
    zip.writeZip(output);
  }
  
var ziph = {
    createZip: createZip, 
}

module.exports = ziph;
