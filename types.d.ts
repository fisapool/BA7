// React types
declare module 'react' {
  export function useState<T>(initialState: T): [T, (newState: T) => void];
  export function useEffect(effect: () => void, deps?: any[]): void;
  
  export interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
}

// Node modules
declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
}

declare module 'fs' {
  export function writeFileSync(path: string, data: string): void;
  export function readFileSync(path: string, encoding: string): string;
  export function unlinkSync(path: string): void;
  export function existsSync(path: string): boolean;
  export function mkdirSync(path: string, options?: { recursive?: boolean }): void;
}

// Global Process
declare namespace NodeJS {
  interface Process {
    env: {
      [key: string]: string | undefined;
    };
  }
}

declare const process: NodeJS.Process; 