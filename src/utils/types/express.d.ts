import 'express';

declare module 'express' {
  export interface Request {
    fullurl: string;
  }
}
