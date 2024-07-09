// global.d.ts
declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean;
    mount: () => void;
    unmount: () => void;
  }
}

export {};
