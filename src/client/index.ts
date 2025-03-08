import { HttpRequestInit, RequestBody, ResponseType, XanreqClientConfig } from "./types";
import crypto from "./crypto";

class XanreqClient {
   private config: XanreqClientConfig;
   private token: string | null = null;
   private tokenLoading: boolean = false;
   private Cache = new Map<string, any>();
   private secret: string;
   private secret_length: number;
   private signerure: string;
   private signerure_key = "x-xanreq-signeture"
   private reqkey: string;

   constructor(config: XanreqClientConfig) {
      this.config = config
      this.secret_length = config.secret.length - (Math.floor(Math.random() * 11) + 5);
      this.secret = crypto.hash(config.secret.substring(0, this.secret_length))
      const signeture = crypto.encrypt(config.secret, this.secret);
      const signetureHash = crypto.hash(signeture);
      const signetureSecret = crypto.encrypt(this.secret, signetureHash);
      this.signerure = `${signeture}.${signetureSecret}`;

      this.init();
   }

   async init() {
      this.handshake();
   }

   private setCache(path: string, method: string, response: any) {
      const cacheKey = `${method}:${path}`;
      if (this.config.cache === true) {
         this.Cache.set(cacheKey, response);
      } else if (this.config.cache) {
         this.config.cache.set(cacheKey, response);
      }
   }

   private getCache(path: string, method: string,) {
      const cacheKey = `${method}:${path}`;
      if (this.config.cache === true) {
         return this.Cache.get(cacheKey);
      } else if (this.config.cache) {
         return this.config.cache.get(cacheKey);
      }
   }

   private PathCache = new Map<string, any>();
   private path(path: string) {
      let pathKey = path
      let has = this.PathCache.get(pathKey)
      if (!has) {
         const { search, pathname } = new URL(path, window.location.origin);
         const params = new URLSearchParams(search);
         const paramsObject = Object.fromEntries(params.entries());
         let split = pathname.split("/").map((s) => crypto.encryptPath(s)).filter((s) => s.length > 0);
         path = `${this.config.path}/${split.join("/")}`;
         if (Object.keys(paramsObject).length) {
            let secret = this.secret;
            const string = JSON.stringify(paramsObject)
            const text = encodeURIComponent(crypto.encrypt(string, secret));
            path += `?${this.reqkey}=${text}`;
         }
         this.PathCache.set(pathKey, path);
      } else {
         path = has
      }
      return path
   }

   private async handshake() {
      this.tokenLoading = true;
      const res = await fetch(this.path(`/handshake`), {
         method: "GET",
         headers: {
            ...this.config.headers,
            [this.signerure_key]: this.signerure
         },
      })
      const { data } = await res.json();
      let token = data || "token"
      this.token = token;
      this.reqkey = token.substring(0, token.length / 2);
      this.tokenLoading = false;
   }

   private async request(path: string, init?: HttpRequestInit): Promise<Response> {
      if (this.tokenLoading) {
         await new Promise((resolve) => {
            const interval = setInterval(() => {
               if (!this.tokenLoading) {
                  clearInterval(interval);
                  resolve(null);
               }
            }, 100);
         })
      }

      if (!this.token) {
         await this.handshake();
      }

      const info: any = {
         method: "GET",
         ...init,
         headers: {
            ...this.config.headers,
            ...init?.headers,
            [this.signerure_key]: this.signerure
         },
      }

      const cache_res = this.getCache(path, info.method);
      if (cache_res) {
         return cache_res.clone();
      }

      if (info.body) {
         if (!this.token) throw new Error("Token not loaded")
         const form = new FormData();
         let _data = {}
         for (let key in info.body) {
            let ukey = crypto.encryptPath(key);
            if (info.body[key] instanceof File) {
               form.append(ukey, info.body[key]);
            } else {
               _data[ukey] = info.body[key];
            }
         }
         const blob = new Blob([crypto.encrypt(_data, this.token)], { type: "text/xanreq" });
         form.append(this.reqkey, blob, "data.xanreq");
         info.body = form
      }
      const res = await fetch(this.path(path), info);
      if (res.status === 401) {
         this.token = null;
         return await this.request(path, init);
      } else if (res.status === 200) {
         this.setCache(path, info.method, res.clone());
      }
      return res
   }

   async get<T>(path: string, init?: HttpRequestInit): Promise<ResponseType<T>> {
      const res = await this.request(path, init);
      const data = await res.json();
      return data;
   }

   async post<T>(path: string, body: RequestBody, init?: HttpRequestInit): Promise<ResponseType<T>> {
      const res = await this.request(path, {
         ...init,
         method: "POST",
         body: body
      });
      return await res.json();
   }

   async put<T>(path: string, body: RequestBody, init?: HttpRequestInit): Promise<ResponseType<T>> {
      const res = await this.request(path, {
         ...init,
         method: "PUT",
         body: body
      });
      return await res.json();
   }

   async delete<T>(path: string, init?: HttpRequestInit): Promise<ResponseType<T>> {
      const res = await this.request(path, {
         ...init,
         method: "DELETE",
      });
      return await res.json();
   }
}

export default XanreqClient