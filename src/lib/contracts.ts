export const API_VERSION = 'v1';
export const HEALTH_OK_STATUS = 'ok';
export interface HealthStatusResponse {
  status: string;
  info: Record<string, { status: string; message?: string }>;
  error: Record<string, { status: string; message?: string }>;
  details: Record<string, { status: string; message?: string }>;
}
