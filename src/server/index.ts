import { HTTPMethods, RequestBody } from "../client/types";
import { XanreqServerConfig } from "./types";


class XanreqServer {
   constructor(config: XanreqServerConfig) {
      console.log('XanReqServer')
   }

   async get(path, handler) {

   }

   async listen(path: string, method: HTTPMethods, body: RequestBody) {
      console.log(path, method, body);
   }
}

export default XanreqServer;