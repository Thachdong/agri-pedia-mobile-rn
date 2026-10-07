import { env } from '@/shared/config';
import { createHttpClient } from './create-http-client';

/** The app's HTTP client (NestJS API). Session headers + 401 refresh are wired in by the auth-session step. */
export const http = createHttpClient({ baseUrl: env.apiUrl });
