export type XanreqClientConfig = {
   secret: string;
   path?: string;
   headers?: Record<string, string>;
   cache?: boolean | {
      get: (url: string) => any;
      set: (url: string, value: any) => void;
   };
}


export type HTTPMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";