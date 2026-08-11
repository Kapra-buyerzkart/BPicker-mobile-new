export interface ApiConfig {
  BASE_URL: string;
  IMAGE_BASE_URL: string;
  TIMEOUT_MS: number;
}

export const API_CONFIG: ApiConfig = {
  BASE_URL: 'https://core.kapradaily.com/api/V1',
  IMAGE_BASE_URL: 'https://backend.kapradaily.com/',
  TIMEOUT_MS: 15000,
};
