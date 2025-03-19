declare module 'express' {
  import { IncomingMessage, ServerResponse } from 'http';
  
  export interface Request extends IncomingMessage {
    params: Record<string, string>;
    body: any;
    query: Record<string, string>;
  }
  
  export interface Response extends ServerResponse {
    json(body: any): void;
    status(code: number): Response;
  }
  
  export interface Router {
    get(path: string, handler: (req: Request, res: Response) => void): void;
    post(path: string, handler: (req: Request, res: Response) => void): void;
  }
  
  export function Router(): Router;
  
  export default function createApplication(): {
    use(middleware: any): any;
    listen(port: number, callback?: () => void): any;
    Router: typeof Router;
  };
}

declare module 'python-shell' {
  export interface PythonShellOptions {
    mode?: string;
    pythonPath?: string;
    scriptPath?: string;
    args?: string[];
  }
  
  export class PythonShell {
    static run(script: string, options: PythonShellOptions, callback: (err: Error | null, results?: any) => void): void;
  }
}

declare module 'uuid' {
  export function v4(): string;
} 