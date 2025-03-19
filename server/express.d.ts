declare module 'express' {
  import { Server } from 'http';
  
  export interface Request {
    params: Record<string, string>;
    body: any;
    query: Record<string, string>;
    path: string;
    headers: Record<string, string | string[]>;
  }
  
  export interface Response {
    status(code: number): Response;
    json(data: any): void;
    send(body: any): void;
    sendFile(path: string): void;
    end(): void;
  }
  
  export interface NextFunction {
    (err?: any): void;
  }
  
  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): void;
  }
  
  export interface Router {
    get(path: string, ...handlers: RequestHandler[]): Router;
    post(path: string, ...handlers: RequestHandler[]): Router;
    put(path: string, ...handlers: RequestHandler[]): Router;
    delete(path: string, ...handlers: RequestHandler[]): Router;
    use(...handlers: RequestHandler[]): Router;
    use(path: string, ...handlers: RequestHandler[]): Router;
  }
  
  export interface Application {
    use(path: string, router: Router): Application;
    use(handler: RequestHandler): Application;
    listen(port: number, callback?: () => void): Server;
  }
  
  export function Router(): Router;
  
  // Express main function
  export default function express(): Application;
} 