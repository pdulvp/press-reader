
import { ContentTypes, type ContentType } from "./ContentTypes.mts";
import http from "node:http";
import { requesth } from "./utils/requesth.mts"

type RequestProcessor = {
  read: {
    asJson(): any
  };
  url: string | undefined;
  writeHead: (type:string, value:string) => void;
  json: (json:any) => void;
  end: (chunk:any, type: ContentType) => void;
  error: (error:any) => void;
}

var create: (request: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => RequestProcessor = function(request, res) {
  let processor = { 
    url: request.url,
    head: {},
    writeHead: (type, value) => { processor.head[type] = value },
    end: (chunk, type) => {
      if (type) {
        processor.writeHead("Content-Type", type.contentType);
      }
      res.writeHead(200, processor.head);
      res.end(chunk, type.encoding);
      processor.head = {};
    }, 
    json: (json) => {
      processor.end(JSON.stringify(json, null, ""), ContentTypes.JSON)
    },
    error: (e) => {
      processor.json({ status: "error", message: `An error occured.` });
    },
    read: {
      asJson: () => {
        return requesth.json(request);
      }
    }
  };
  return processor;
};

export {
  create as createProcessor,
  type RequestProcessor
}
