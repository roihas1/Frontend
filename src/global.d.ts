// global.d.ts
export {};

declare global {
  interface Window {
    RUNTIME_CONFIG: {
      VITE_BASE_URL: string;
      [key: string]: string;
    };
  }
}
