export type TokenSource = "app" | "fine-grained" | "classic";

export interface TokenMetadata {
  source: TokenSource;
  expiresAt?: string;
  scopes?: string[];
}

export interface StoredToken extends TokenMetadata {
  accessToken: string;
}

export type PublicTokenState = { connected: false } | ({ connected: true } & TokenMetadata);

export interface DeviceAuthorization {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  expiresIn: number;
  interval: number;
}
