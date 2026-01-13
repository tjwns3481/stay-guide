/**
 * Settings Page
 * 계정 설정 페이지
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';

export default async function SettingsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">설정</h1>
        <p className="text-muted-foreground mt-1">계정 정보를 관리하세요</p>
      </div>

      {/* Profile Settings */}
      <ProfileSettings
        user={{
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          imageUrl: user.imageUrl,
        }}
      />

      {/* Account Settings */}
      <AccountSettings />
    </div>
  );
}
