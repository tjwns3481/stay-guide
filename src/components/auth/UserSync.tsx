'use client';

/**
 * UserSync Component
 * Clerk 사용자를 hosts 테이블과 동기화
 */

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // 사용자 정보를 호스트 테이블과 동기화
      syncUser();
    }
  }, [isLoaded, user]);

  const syncUser = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName || user.firstName || null,
          profileImage: user.imageUrl || null,
        }),
      });

      if (!response.ok) {
        console.error('Failed to sync user');
      }
    } catch (error) {
      console.error('Error syncing user:', error);
    }
  };

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
}
