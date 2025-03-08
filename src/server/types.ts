export type XanreqServerConfig = {
   secret: string;
   cache?: boolean | {
      get: (key: string) => any;
      set: (key: string, response: Response) => void;
   };
}