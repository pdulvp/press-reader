
const ContentTypes : { 
  CBZ: ContentTypeProperties, CJS:ContentTypeProperties , MJS:ContentTypeProperties , 
  JS: ContentTypeProperties, CSS: ContentTypeProperties, WOFF2: ContentTypeProperties, 
  TTF: ContentTypeProperties, JSON: ContentTypeProperties, HTML: ContentTypeProperties,
  MAP: ContentTypeProperties, SVG: ContentTypeProperties, PNG: ContentTypeProperties, 
  JPG: ContentTypeProperties, PDF: ContentTypeProperties, UNKNOWN: ContentTypeProperties } = {

  CBZ: { extension: "cbz", contentType: 'application/zip', encoding: "binary" },
  CJS: { extension: "cjs", contentType: 'text/javascript', encoding: "utf-8" },
  MJS: { extension: "mjs", contentType: 'text/javascript', encoding: "utf-8" },
  JS: { extension: "js", contentType: 'text/javascript', encoding: "utf-8" },
  CSS: { extension: "css", contentType: 'text/css', encoding: "utf-8" },
  WOFF2: { extension: "woff2", contentType: 'font/woff2', encoding: "binary" },
  JSON: { extension: "json", contentType: 'application/json', encoding: "utf-8" },
  PNG: { extension: "png", contentType: 'image/png', encoding: "binary" },
  JPG: { extension: "jpg", contentType: 'image/jpg', encoding: "binary" },
  PDF: { extension: "pdf", contentType: 'pdf', encoding: "binary" },
  TTF: { extension: "ttf", contentType: 'font/ttf', encoding: "binary" },
  HTML: { extension: "html", contentType: 'text/html; charset=utf-8', encoding: "utf-8" },
  MAP: { extension: "map", contentType: 'text/plain', encoding: "utf-8" },
  SVG: { extension: "svg", contentType: 'image/svg+xml', encoding: "utf-8" },

  UNKNOWN: { extension: "html", contentType: 'text/html; charset=utf-8', encoding: "utf-8" },
} as const;

type ContentType = typeof ContentTypes[keyof typeof ContentTypes];

type ContentTypeProperties = {
  extension: string;
  contentType: string;
  encoding: string;
};

function from(filename: string): ContentTypeProperties {
  let extension = filename.substring(filename.lastIndexOf(".") + 1);
  let result = Object.keys(ContentTypes).find(k => k == extension.toUpperCase());
  return result != undefined ? ContentTypes[result]: ContentTypes.UNKNOWN;
}

export {
  type ContentType, ContentTypes, from
}
