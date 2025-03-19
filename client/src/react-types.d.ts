// Add React JSX support
declare namespace React {
  interface ChangeEvent<T = Element> {
    target: T;
    currentTarget: T;
  }
  
  interface HTMLAttributes<T> {
    [key: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export default {} as any;
  export const jsx: any;
  export const jsxs: any;
} 