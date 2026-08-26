/** The extension service worker exposes MV3 as `chrome`; only what e2e seeds is declared. */
interface SeededToken {
  accessToken: string;
  source: string;
}

interface SeededStorage {
  [key: string]: SeededToken;
}

declare const chrome: {
  storage: {
    local: {
      set(items: SeededStorage): Promise<void>;
      clear(): Promise<void>;
    };
  };
};
