/**
 * MSW Mock 설정 검증 테스트
 * T0.5.2: MSW Mock 설정 완료 검증
 */

import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/mocks/server';
import { mockHosts, mockGuidebooks, mockBlocks } from '@/mocks/data';

describe('MSW Mock 설정 검증', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Mock 데이터', () => {
    it('mockHosts가 올바르게 정의되어 있어야 함', () => {
      expect(mockHosts).toBeDefined();
      expect(Array.isArray(mockHosts)).toBe(true);
      expect(mockHosts.length).toBeGreaterThan(0);
    });

    it('mockGuidebooks에는 필수 필드가 포함되어야 함', () => {
      expect(mockGuidebooks.length).toBeGreaterThan(0);
      const guidebook = mockGuidebooks[0];
      expect(guidebook).toHaveProperty('id');
      expect(guidebook).toHaveProperty('hostId');
      expect(guidebook).toHaveProperty('slug');
      expect(guidebook).toHaveProperty('title');
    });

    it('mockBlocks가 올바른 구조를 가져야 함', () => {
      expect(Array.isArray(mockBlocks)).toBe(true);
      expect(mockBlocks.length).toBeGreaterThan(0);

      const block = mockBlocks[0];
      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('guidebookId');
      expect(block).toHaveProperty('type');
      expect(block).toHaveProperty('title');
      expect(block).toHaveProperty('content');
      expect(block).toHaveProperty('order');
      expect(block).toHaveProperty('isVisible');
    });

    it('wifi 블록 데이터가 올바른 구조를 가지고 있어야 함', () => {
      const wifiBlock = mockBlocks.find((b) => b.type === 'wifi');
      expect(wifiBlock).toBeDefined();
      if (wifiBlock && wifiBlock.type === 'wifi') {
        expect(wifiBlock.content).toHaveProperty('ssid');
        expect(wifiBlock.content).toHaveProperty('password');
      }
    });

    it('블록들은 guidebookId로 필터링될 수 있어야 함', () => {
      const guidebookId = 'guidebook-1';
      const filtered = mockBlocks.filter((b) => b.guidebookId === guidebookId);
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((b) => b.guidebookId === guidebookId)).toBe(true);
    });
  });
});
