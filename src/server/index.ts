import { HTTPMethods, RequestBody } from "../client/types";
import { XanreqServerConfig } from "./types";


class XanreqServer {
   constructor(config: XanreqServerConfig) {
      console.log('XanReqServer')
   }

   async get(path: string, handler: Function) {

   }

   async listen(path: string, method: HTTPMethods, body: RequestBody) {
      console.log(path, method, body);

      return {
         message: 'Hello World',
         data: "",
         status: 500,
         errors: []
      }
   }
}

export default XanreqServer;