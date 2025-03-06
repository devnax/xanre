import { XanreqClientConfig } from "./types";
import crypto from "./crypto";
import { sha256 } from "js-sha256";
import nacl from "tweetnacl";

class XanreqClient {
   private config: XanreqClientConfig;
   private token: string | null = null;
   private tokenLoading: boolean = false;
   private Cache = new Map<string, any>();
   private randomSecret: string;

   constructor(config: XanreqClientConfig) {
      this.config = config;
      const secret = this.secret();
      const hand = crypto.encrypt(secret, secret)
      const shake = crypto.encrypt(secret, crypto.hash(hand));
      config.headers = {
         ...config.headers,
         "x-xanreq-signeture": `${hand}.${shake}`,
      }

      this.init();
   }

   private secret() {
      if (!this.randomSecret) {
         this.randomSecret = crypto.generateSecret();
      }
      return crypto.hash(this.randomSecret + this.config.secret)
   }

   async init() {
      this.handshake();
   }

   private setCache(path: string, method: string, data: any, value: any) {
      if (this.config.cache === true) {
         // this.Cache.set(url, value);
      } else if (this.config.cache) {
         // this.config.cache.set(url, value);
      }
   }

   private getCache(url: string) {
      if (this.config.cache === true) {
         // this.Cache.set(url, value);
      } else if (this.config.cache) {
         // this.config.cache.set(url, value);
      }
   }

   private PathCache = new Map<string, any>();
   private path(p: string) {
      let path = this.PathCache.get(p)
      if (!path) {
         let split = p.split("/").map((s) => crypto.encryptPath(s)).filter((s) => s.length > 0);
         path = "/" + split.join("/");
         // path = p
         this.PathCache.set(p, path);
      }
      return this.formatParams(this.config.path + path);
   }

   private formatParams(url: string) {
      const { search, origin, pathname } = new URL(url, window.location.origin);
      const params = new URLSearchParams(search);
      const paramsObject = Object.fromEntries(params.entries());
      let n = `${origin}${pathname}`;
      if (Object.keys(paramsObject).length) {
         let secret = this.secret();
         const string = JSON.stringify(paramsObject)
         const text = encodeURIComponent(crypto.encrypt(string, secret));
         n += `?${secret.substring(0, 20)}=${text}`;
      }
      return n
   }

   private formatData(data: object) {
      let files = {}
      let _data = {}
      for (let key in data) {
         if (data[key] instanceof File) {
            files[key] = data[key];
         } else {
            _data[key] = data[key];
         }
      }

      const string = JSON.stringify({
         data: _data,
      })

      const secret = this.secret()
      const text = crypto.encrypt(string, secret);
      const blob = new Blob([text], { type: "text/xanreq" });
      const form = new FormData();
      for (let key in files) {
         form.append(key, files[key]);
      }
      form.append(secret.substring(0, 20), blob, "store.xanreq");
      return form
   }

   private async handshake() {
      this.tokenLoading = true;
      const res = await fetch(this.path(`/handshake/users/1`), {
         method: "GET",
         headers: {
            ...this.config.headers,
         },
      })
      const { token } = await res.json();
      this.token = token;
      this.tokenLoading = false;
   }

   private async request(path: string, data?: any, requestOpt?: RequestInit): Promise<Response> {

      const res = await fetch(this.path(path), {
         ...requestOpt,
         headers: {
            ...this.config.headers
         },
         body: data ? JSON.stringify(data) : undefined
      });
      return res
   }

   async get<T>(path: string): Promise<T> {

      const res = await fetch(this.config.path + path, {
         headers: {
            ...this.config.headers
         }
      });
      const data = await res.json();

      return data;
   }

   async post<T>(path: string, data: any): Promise<T> {
      const res = await fetch(this.config.path + path, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "x-xanreq-secret": this.secret(),
            ...this.config.headers
         },
         body: JSON.stringify(data)
      });
      return await res.json();
   }

   async put<T>(path: string, data: any): Promise<T> {
      const res = await fetch(this.config.path + path, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            "x-xanreq-secret": this.secret(),
            ...this.config.headers
         },
         body: JSON.stringify(data)
      });
      return await res.json();
   }

   async delete<T>(path: string): Promise<T> {
      const res = await fetch(this.config.path + path, {
         method: "DELETE",
         headers: {
            "x-xanreq-secret": this.secret(),
            ...this.config.headers
         }
      });
      return await res.json();
   }
}

export default XanreqClient