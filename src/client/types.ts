export type XanreqClientConfig = {
   secret: string;
   path?: string;
   headers?: Record<string, string>;
   cache?: boolean | {
      get: (key: string) => any;
      set: (key: string, response: Response) => void;
   };
}


export type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";

export type RequestBody = {
   [key: string]: any;
}

export type HttpRequestInit = Omit<RequestInit, 'body'> & {
   body?: RequestBody;
}

export type ResponseError = {
   field: string;
   message: string;
}

export type ResponseType<D> = {
   status: number;
   message: string;
   data: D;
   errors?: ResponseError[]
}

