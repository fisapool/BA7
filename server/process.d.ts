declare namespace NodeJS {
  interface ProcessEnv {
    PYTHON_PATH?: string;
    [key: string]: string | undefined;
  }
  
  interface Process {
    env: ProcessEnv;
  }
}

declare var process: NodeJS.Process; 