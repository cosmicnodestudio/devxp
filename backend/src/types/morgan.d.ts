// Morgan types (for HTTP logging)
declare module 'morgan' {
  import { RequestHandler } from 'express';

  interface StreamOptions {
    write: (message: string) => void;
  }

  function morgan(
    format: string,
    options?: {
      stream?: StreamOptions;
      skip?: (req: any, res: any) => boolean;
      immediate?: boolean;
    }
  ): RequestHandler;

  export = morgan;
}
