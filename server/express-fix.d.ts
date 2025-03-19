// Express module augmentation
declare module 'express' {
  export default function express(): any;
  
  namespace express {
    export function Router(): any;
  }
} 