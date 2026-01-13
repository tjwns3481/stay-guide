/**
 * MSW 브라우저 설정
 * 브라우저 개발 환경에서 사용 (옵션)
 */

import { setupWorker } from 'msw/browser';
import { authHandlers, guidebookHandlers, blockHandlers } from './handlers';

/**
 * MSW 워커 인스턴스
 * @example
 * // app/layout.tsx (개발 환경)
 * if (process.env.NODE_ENV === 'development') {
 *   const { worker } = await import('@/mocks/browser');
 *   await worker.start();
 * }
 */
export const worker = setupWorker(
  ...authHandlers,
  ...guidebookHandlers,
  ...blockHandlers
);
