export interface ApiKeyView {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  enabled: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  requestCount: number;
  rateLimitEnabled: boolean;
  rateLimitMax: number | null;
}
