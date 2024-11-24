export interface RateLimitOptions {
  authenticated: {
    windowSize: number;
    limit: number;
  };
  unauthenticated: {
    windowSize: number;
    limit: number;
  };
  violations: {
    memoryDuration: number;
  };
  keyPrefixes: {
    ip: string;
  };
}
