/**
 * Settings Page Tests (TDD)
 * Phase 4, T4.4 - 설정 페이지
 */

import { describe, it, expect, vi } from 'vitest';

// React cache mock
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    cache: (fn: Function) => fn,
  };
});

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isLoaded: true,
    user: {
      id: 'test-clerk-id',
      firstName: 'Test',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    },
  }),
}));

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: () =>
    Promise.resolve({
      id: 'test-clerk-id',
      firstName: 'Test',
      primaryEmailAddress: { emailAddress: 'test@example.com' },
    }),
}));

describe('Settings Page', () => {
  it('설정 페이지가 존재한다', async () => {
    const SettingsPage = await import(
      '@/app/(dashboard)/dashboard/settings/page'
    );
    expect(SettingsPage.default).toBeDefined();
  });
});

describe('Settings Components', () => {
  it('ProfileSettings 컴포넌트가 export 되어 있다', async () => {
    const { ProfileSettings } = await import(
      '@/components/settings/ProfileSettings'
    );
    expect(ProfileSettings).toBeDefined();
  });

  it('AccountSettings 컴포넌트가 export 되어 있다', async () => {
    const { AccountSettings } = await import(
      '@/components/settings/AccountSettings'
    );
    expect(AccountSettings).toBeDefined();
  });
});
