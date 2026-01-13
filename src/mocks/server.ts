/**
 * MSW 서버 설정 (Node.js 환경)
 * Vitest 및 테스트 환경에서 사용
 */

import { setupServer } from 'msw/node';
import { authHandlers, guidebookHandlers, blockHandlers } from './handlers';

/**
 * MSW 서버 인스턴스
 * @example
 * // vitest.setup.ts
 * import { server } from '@/mocks/server';
 * beforeAll(() => server.listen());
 * afterEach(() => server.resetHandlers());
 * afterAll(() => server.close());
 */
export const server = setupServer(
  ...authHandlers,
  ...guidebookHandlers,
  ...blockHandlers
);
