// global.d.ts
export {};

declare global {
  interface Window {
    RUNTIME_CONFIG: {
      VITE_BASE_URL: string;
      MAINTENANCE_MODE: string;
      [key: string]: string;
    };
  }
}
