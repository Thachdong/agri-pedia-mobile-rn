import { APP_ERROR_CODE, AppError } from './app-error';

const UPLOAD_TIMEOUT_MS = 60_000;

export type TUploadToSignedUrlOptions = {
  /** Exactly the headers returned with the signed URL (Content-Type, x-goog-content-length-range). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * PUT a local file (`uri` from the device pickers) to a signed storage URL — absolute URL, no Bearer, no JSON.
 * Errors → AppError: no response → NETWORK_ERROR / TIMEOUT, storage refused → UPLOAD_FAILED (status kept).
 */
export async function uploadToSignedUrl(
  url: string,
  fileUri: string,
  { headers, signal }: TUploadToSignedUrlOptions = {},
): Promise<void> {
  if (signal?.aborted) throw signal.reason ?? new Error('Aborted');

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, UPLOAD_TIMEOUT_MS);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  let response: Response;
  try {
    const file = await (await fetch(fileUri)).blob();
    response = await fetch(url, { method: 'PUT', headers, body: file, signal: controller.signal });
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new AppError(
      timedOut
        ? { status: 0, code: APP_ERROR_CODE.TIMEOUT, message: 'Upload timed out' }
        : { status: 0, code: APP_ERROR_CODE.NETWORK_ERROR, message: 'Upload failed' },
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }

  if (!response.ok) {
    throw new AppError({ status: response.status, code: APP_ERROR_CODE.UPLOAD_FAILED, message: `Upload rejected (${response.status})` });
  }
}
