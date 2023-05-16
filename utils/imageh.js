var PImage = require('pureimage');
const { Readable } = require('stream');
const { Writable } = require('stream');

var fs = require('fs');
const { buffer } = require('stream/consumers');

var imageh = {
    resize: (imageData, width, height) => {
        return new Promise(function(resolve, reject) {
            const stream = Readable.from(Buffer.from(imageData, "binary"));
            PImage.decodePNGFromStream(stream).then((img) => {
                if (height == null) height = parseInt(width * img.height / img.width);
                var img2 = PImage.make(width,height);
                var c = img2.getContext('2d');
                c.drawImage(img,
                    0, 0, img.width, img.height,
                    0, 0, width, height
                );
                let body = [];
                const myWritable = new Writable({
                    write(chunk, encoding, callback) {
                        body.push(chunk);
                        callback();
                    },
                    writev(chunks, callback) {
                        chunks.forEach(c => body.push(c));
                        callback();
                    },
                  });
                PImage.encodePNGToStream(img2, myWritable).then(() => {
                    body = Buffer.concat(body).toString("binary");
                    resolve(body);
                }).catch(e => {
                    reject(e);
                });
            }).catch(e => {
                reject(e);
            });
        });
    }
}
module.exports = imageh;
