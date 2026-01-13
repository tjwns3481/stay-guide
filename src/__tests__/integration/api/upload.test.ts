/**
 * Upload API Tests (TDD)
 * Phase 4, T4.3 - 이미지 업로드
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase Storage
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test/image.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/test/image.jpg' } }),
      }),
    },
  }),
}));

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: () => Promise.resolve({ userId: 'test-user-id' }),
}));

describe('Upload API', () => {
  it('POST /api/upload route가 존재한다', async () => {
    const { POST } = await import('@/app/api/upload/route');
    expect(POST).toBeDefined();
  });

  it('인증되지 않은 요청은 401을 반환한다', async () => {
    // Re-mock without userId
    vi.doMock('@clerk/nextjs/server', () => ({
      auth: () => Promise.resolve({ userId: null }),
    }));

    // Clear cache and re-import
    vi.resetModules();
    const { POST } = await import('@/app/api/upload/route');

    const formData = new FormData();
    formData.append('file', new Blob(['test'], { type: 'image/png' }), 'test.png');

    const request = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    expect(response.status).toBe(401);

    // Restore mock
    vi.doMock('@clerk/nextjs/server', () => ({
      auth: () => Promise.resolve({ userId: 'test-user-id' }),
    }));
    vi.resetModules();
  });
});

describe('ImageUpload Component', () => {
  it('ImageUpload 컴포넌트가 export 되어 있다', async () => {
    const { ImageUpload } = await import('@/components/forms/ImageUpload');
    expect(ImageUpload).toBeDefined();
  });
});

describe('Upload Utils', () => {
  it('validateImageFile 함수가 존재한다', async () => {
    const { validateImageFile } = await import('@/lib/utils/upload');
    expect(validateImageFile).toBeDefined();
  });

  it('허용된 이미지 타입만 통과한다', async () => {
    const { validateImageFile } = await import('@/lib/utils/upload');

    // Valid types
    expect(validateImageFile({ type: 'image/jpeg', size: 1000 } as File)).toBe(true);
    expect(validateImageFile({ type: 'image/png', size: 1000 } as File)).toBe(true);
    expect(validateImageFile({ type: 'image/webp', size: 1000 } as File)).toBe(true);

    // Invalid type
    expect(validateImageFile({ type: 'application/pdf', size: 1000 } as File)).toBe(false);
  });

  it('5MB 이상 파일은 거부한다', async () => {
    const { validateImageFile } = await import('@/lib/utils/upload');

    const largeFile = { type: 'image/jpeg', size: 6 * 1024 * 1024 } as File;
    expect(validateImageFile(largeFile)).toBe(false);

    const validFile = { type: 'image/jpeg', size: 4 * 1024 * 1024 } as File;
    expect(validateImageFile(validFile)).toBe(true);
  });
});
